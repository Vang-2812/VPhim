create function public.begin_watch(p_movie_ref uuid,p_episode_key text,p_server_key text,p_session uuid)returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();created boolean;previous public.watch_progress;
begin
 if u is null or not private.is_active(u)then raise exception 'Active account required' using errcode='42501';end if;
 if char_length(p_episode_key)not between 1 and 300 or char_length(p_server_key)not between 1 and 300 then raise exception 'Invalid episode' using errcode='23514';end if;
 insert into public.watch_sessions(id,user_id,movie_ref_id,episode_key,server_key)values(p_session,u,p_movie_ref,p_episode_key,p_server_key)on conflict(id)do nothing;
 created:=found;
 if not exists(select 1 from public.watch_sessions where id=p_session and user_id=u and movie_ref_id=p_movie_ref and episode_key=p_episode_key and server_key=p_server_key)then raise exception 'Invalid playback session' using errcode='42501';end if;
 if created then
  insert into public.watch_resume(user_id,movie_ref_id,episode_key,server_key,session_id)values(u,p_movie_ref,p_episode_key,p_server_key,p_session)on conflict(user_id,movie_ref_id)do update set episode_key=excluded.episode_key,server_key=excluded.server_key,session_id=excluded.session_id,updated_at=clock_timestamp();
 end if;
 select * into previous from public.watch_progress where user_id=u and movie_ref_id=p_movie_ref and episode_key=p_episode_key;
 return jsonb_build_object('sessionId',p_session,'position',previous.position,'duration',previous.duration,'completed',coalesce(previous.completed,false));
end$$;

create function public.record_watch(p_session uuid,p_sequence bigint,p_position double precision,p_duration double precision,p_completed boolean)returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();s public.watch_sessions;done boolean;
begin
 if u is null or not private.is_active(u)then raise exception 'Active account required' using errcode='42501';end if;
 select * into s from public.watch_sessions where id=p_session and user_id=u for update;
 if not found then raise exception 'Playback session not found' using errcode='42501';end if;
 if p_sequence<=s.last_sequence then return jsonb_build_object('accepted',false);end if;
 if not((p_position is null and p_duration is null)or(p_position is not null and p_duration is not null and p_position>=0 and p_position<'Infinity'::double precision and p_duration>0 and p_duration<'Infinity'::double precision and p_position<=p_duration))then raise exception 'Invalid progress' using errcode='23514';end if;
 done:=p_position is not null and(coalesce(p_completed,false)or p_position/p_duration>=0.95);
 update public.watch_sessions set last_sequence=p_sequence where id=p_session;
 insert into public.watch_progress(user_id,movie_ref_id,episode_key,server_key,position,duration,completed,session_id)values(u,s.movie_ref_id,s.episode_key,s.server_key,p_position,p_duration,done,p_session)on conflict(user_id,movie_ref_id,episode_key)do update set server_key=excluded.server_key,position=excluded.position,duration=excluded.duration,completed=excluded.completed,session_id=excluded.session_id,updated_at=clock_timestamp();
 update public.watch_resume set updated_at=clock_timestamp()where user_id=u and movie_ref_id=s.movie_ref_id and session_id=p_session;
 return jsonb_build_object('accepted',true);
end$$;

create function public.clear_watch(p_movie_ref uuid)returns void language plpgsql security definer set search_path='' as $$declare u uuid:=auth.uid();begin
 if u is null or not private.is_active(u)then raise exception 'Active account required' using errcode='42501';end if;
 delete from public.watch_resume where user_id=u and movie_ref_id=p_movie_ref;
 delete from public.watch_progress where user_id=u and movie_ref_id=p_movie_ref;
 delete from public.watch_sessions where user_id=u and movie_ref_id=p_movie_ref;
end$$;

create function public.admin_update_user(p_target uuid,p_status text default null,p_membership text default null)returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();before_row public.user_access;after_row public.user_access;
begin
 if actor is null or not private.is_admin(actor)then raise exception 'Admin required' using errcode='42501';end if;
 select * into before_row from public.user_access where user_id=p_target for update;
 if not found or p_target=actor or before_row.role<>'member'then raise exception 'Cannot modify this user' using errcode='42501';end if;
 if (p_status is not null and p_status not in('active','blocked'))or(p_membership is not null and p_membership not in('normal','vip'))then raise exception 'Invalid user update' using errcode='23514';end if;
 update public.user_access set status=coalesce(p_status,status),membership=coalesce(p_membership,membership),updated_at=clock_timestamp()where user_id=p_target returning * into after_row;
 insert into public.admin_audit_logs(actor_id,target_id,action,before_value,after_value)values(actor,p_target,'update_user',to_jsonb(before_row),to_jsonb(after_row));
 if before_row.status<>after_row.status then insert into public.auth_sync_jobs(user_id,status)values(p_target,after_row.status)on conflict(user_id)do update set status=excluded.status,revision=public.auth_sync_jobs.revision+1,updated_at=clock_timestamp();end if;
 return jsonb_build_object('authSyncPending',exists(select 1 from public.auth_sync_jobs where user_id=p_target));
end$$;

create function public.admin_list_users(p_search text default '',p_membership text default null,p_status text default null,p_page integer default 1)returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;total bigint;page_number integer:=greatest(1,least(coalesce(p_page,1),100000));search_term text:='%'||left(coalesce(p_search,''),100)||'%';
begin
 if not private.is_admin(auth.uid())then raise exception 'Admin required' using errcode='42501';end if;
 select count(*)into total from public.user_access a join public.profiles p on p.id=a.user_id join auth.users u on u.id=a.user_id where(p.display_name ilike search_term or u.email ilike search_term)and(p_membership is null or a.membership=p_membership)and(p_status is null or a.status=p_status);
 select coalesce(jsonb_agg(to_jsonb(rows)),'[]'::jsonb)into result from(select a.user_id as id,p.display_name as "displayName",u.email,u.created_at as "createdAt",a.role,a.membership,a.status,exists(select 1 from public.auth_sync_jobs j where j.user_id=a.user_id)as "authSyncPending" from public.user_access a join public.profiles p on p.id=a.user_id join auth.users u on u.id=a.user_id where(p.display_name ilike search_term or u.email ilike search_term)and(p_membership is null or a.membership=p_membership)and(p_status is null or a.status=p_status)order by u.created_at desc,a.user_id limit 20 offset(page_number-1)*20)rows;
 return jsonb_build_object('items',result,'page',page_number,'totalPages',greatest(1,ceil(total/20.0)));
end$$;

revoke all on function public.begin_watch(uuid,text,text,uuid),public.record_watch(uuid,bigint,double precision,double precision,boolean),public.clear_watch(uuid),public.admin_update_user(uuid,text,text),public.admin_list_users(text,text,text,integer)from public,anon;
grant execute on function public.begin_watch(uuid,text,text,uuid),public.record_watch(uuid,bigint,double precision,double precision,boolean),public.clear_watch(uuid),public.admin_update_user(uuid,text,text),public.admin_list_users(text,text,text,integer)to authenticated;
