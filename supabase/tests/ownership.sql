insert into auth.users(id,email,raw_user_meta_data) values ('11111111-1111-4111-8111-111111111111','a@example.test','{"role":"admin","membership":"vip"}'),('22222222-2222-4222-8222-222222222222','b@example.test','{}');
insert into public.movie_refs(id,provider_id,slug,title) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','movie-a','movie-a','Movie A');
insert into public.playlists(id,user_id,name) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','Private B');
insert into public.favorites(user_id,movie_ref_id)values('22222222-2222-4222-8222-222222222222','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
insert into storage.objects(bucket_id,name)values('avatars','22222222-2222-4222-8222-222222222222/private.webp');
set local role authenticated;select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$begin
 assert (select role from public.user_access where user_id=auth.uid())='member','Untrusted metadata escalated role';
 assert (select membership from public.user_access where user_id=auth.uid())='normal','Untrusted metadata escalated membership';
 assert (select count(*) from public.favorites)=0,'Read another user favorites';
 assert (select count(*) from public.playlists)=0,'Read another user playlist';
 assert (select count(*) from storage.objects)=0,'Read another user avatar';
 begin update public.profiles set id='22222222-2222-4222-8222-222222222222' where id=auth.uid();raise exception 'Profile ID writable';exception when insufficient_privilege then null;end;
 begin insert into public.playlist_items(playlist_id,movie_ref_id)values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');raise exception 'Ownership write bypass';exception when insufficient_privilege then null;end;
 begin update public.user_access set role='admin' where user_id=auth.uid();raise exception 'Role writable';exception when insufficient_privilege then null;end;
 insert into public.favorites(user_id,movie_ref_id)values(auth.uid(),'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
 assert (select count(*) from public.favorites)=1,'Owner cannot save favorite';
end$$;
reset role;
