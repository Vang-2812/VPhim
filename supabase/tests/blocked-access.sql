insert into auth.users(id,email)values('11111111-1111-4111-8111-111111111111','a@example.test');
insert into public.movie_refs(id,provider_id,slug,title)values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','a','a','A');
insert into public.favorites(user_id,movie_ref_id)values('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
update public.user_access set status='blocked' where user_id='11111111-1111-4111-8111-111111111111';
set local role authenticated;select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$begin
 assert (select count(*)from public.favorites)=0,'Old JWT reads private data';
 assert (select count(*)from public.movie_refs)=1,'Public movie unavailable';
 assert (select count(*)from public.user_access)=1,'Blocked user cannot read own status';
 begin insert into public.playlists(user_id,name)values(auth.uid(),'Blocked');raise exception 'Old JWT writes data';exception when insufficient_privilege then null;end;
end$$;reset role;
