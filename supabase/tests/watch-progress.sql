insert into auth.users(id,email)values('11111111-1111-4111-8111-111111111111','a@example.test');
insert into public.movie_refs(id,provider_id,slug,title)values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','a','a','A');
set local role authenticated;select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select public.begin_watch('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','s1-tap-1','vs','cccccccc-cccc-4ccc-8ccc-cccccccccccc');
select public.record_watch('cccccccc-cccc-4ccc-8ccc-cccccccccccc',2,40,100,false);
select public.record_watch('cccccccc-cccc-4ccc-8ccc-cccccccccccc',1,20,100,false);
do $$begin assert(select position from public.watch_progress)=40,'Late sequence overwrites progress';end$$;
select public.begin_watch('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','s2-tap-1','vs','dddddddd-dddd-4ddd-8ddd-dddddddddddd');
select public.record_watch('cccccccc-cccc-4ccc-8ccc-cccccccccccc',3,60,100,false);
do $$begin assert(select episode_key from public.watch_resume)='s2-tap-1','Old device stole resume pointer';end$$;
select public.record_watch('dddddddd-dddd-4ddd-8ddd-dddddddddddd',1,null,null,false);
do $$begin
 assert(select position is null from public.watch_progress where episode_key='s2-tap-1'),'Iframe manufactured a time';
 assert(select count(*)from public.watch_progress)=2,'Seasons collapsed';
 begin perform public.record_watch('dddddddd-dddd-4ddd-8ddd-dddddddddddd',2,'NaN'::double precision,100,false);raise exception 'NaN accepted';exception when check_violation then null;end;
end$$;reset role;
