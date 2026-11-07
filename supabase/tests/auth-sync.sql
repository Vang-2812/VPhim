insert into auth.users(id,email)values('11111111-1111-4111-8111-111111111111','a@example.test');
insert into public.auth_sync_jobs(user_id,status)values('11111111-1111-4111-8111-111111111111','blocked');
set local role service_role;
do $$declare a jsonb;b jsonb;begin
 a:=public.claim_auth_sync('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');assert a->>'state'='claimed';
 b:=public.claim_auth_sync('11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');assert b->>'state'='busy','Concurrent provider worker got lease';
end$$;reset role;
update public.auth_sync_jobs set status='active',revision=2 where user_id='11111111-1111-4111-8111-111111111111';
set local role service_role;
do $$declare r jsonb;begin
 r:=public.finish_auth_sync('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1);assert r->>'state'='changed';
 r:=public.finish_auth_sync('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',2);assert r->>'state'='done';
end$$;reset role;
do $$begin assert(select revision=2 and not pending from public.auth_sync_jobs),'Sync state was deleted or revision reset';end$$;
do $$begin
 assert not has_function_privilege('authenticated','public.claim_auth_sync(uuid,uuid)','execute'),'User can claim a service lease';
 assert not has_function_privilege('anon','public.finish_auth_sync(uuid,uuid,bigint)','execute'),'Guest can finish service jobs';
end$$;
-- Expired worker completion must requeue state, even after a newer worker won.
update public.auth_sync_jobs set status='blocked',revision=revision+1 where user_id='11111111-1111-4111-8111-111111111111';
set local role service_role;
select public.claim_auth_sync('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
reset role;
update public.auth_sync_jobs set lease_until=clock_timestamp()-interval '1 second',status='active',revision=revision+1 where user_id='11111111-1111-4111-8111-111111111111';
set local role service_role;
do $$declare r jsonb;begin
 r:=public.claim_auth_sync('11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');assert r->>'state'='claimed';
 r:=public.finish_auth_sync('11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',4);assert r->>'state'='done';
 r:=public.finish_auth_sync('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',3);assert r->>'state'='lost';
end$$;reset role;
do $$begin assert(select pending and revision=5 and status='active' from public.auth_sync_jobs),'Late worker lost desired-state reconciliation';end$$;
