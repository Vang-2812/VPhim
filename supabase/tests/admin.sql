insert into auth.users(id,email)values('11111111-1111-4111-8111-111111111111','a@example.test'),('22222222-2222-4222-8222-222222222222','b@example.test');
update public.user_access set role='admin' where user_id='11111111-1111-4111-8111-111111111111';
set local role authenticated;select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$begin begin perform public.admin_update_user('11111111-1111-4111-8111-111111111111','blocked',null);raise exception 'Member used admin RPC';exception when insufficient_privilege then null;end;end$$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$begin begin perform public.admin_update_user('11111111-1111-4111-8111-111111111111','blocked',null);raise exception 'Admin self-locked';exception when insufficient_privilege then null;end;end$$;
select public.admin_update_user('22222222-2222-4222-8222-222222222222','blocked','vip');
reset role;
do $$begin
 assert(select status from public.user_access where user_id='22222222-2222-4222-8222-222222222222')='blocked','Block ineffective';
 assert(select role from public.user_access where user_id='22222222-2222-4222-8222-222222222222')='member','VIP elevated admin';
 assert(select count(*)from public.admin_audit_logs)=1,'Audit absent';
 assert(select count(*)from public.auth_sync_jobs)=1,'Auth sync not queued';
end$$;
