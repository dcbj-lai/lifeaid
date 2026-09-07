const {test}=require('node:test');
const assert=require('node:assert/strict');
const m=require('/tmp/lifeaid-rbac-test/model.js');
const [admin,student]=m.demoUsers;
test('student scopes records by people ID',()=>{
 assert.equal(m.hasRecordPermission(student,m.demoRoles,'applications.view','DEMO-P-1001'),true);
 assert.equal(m.hasRecordPermission(student,m.demoRoles,'applications.view','DEMO-P-1002'),false);
 assert.equal(m.hasRecordPermission(student,m.demoRoles,'applications.view',undefined),false);
});
test('student has no staff actions or administration',()=>{
 for(const p of ['applications.approve','awards.post','renewals.approve','time.verify','stipends.release','users.roles.assign'])assert.equal(m.hasPermission(student,m.demoRoles,p),false);
 assert.equal(m.canViewPage(student,m.demoRoles,'Access control'),false);
});
test('super admin has every registered permission',()=>{
 for(const {key} of m.permissions)assert.equal(m.hasPermission(admin,m.demoRoles,key),true);
});
test('roles union explicit grants without implying actions',()=>{
 const roles=[{id:'a',permissions:['applications.view.all']},{id:'b',permissions:['stipends.verify']}];
 const u={...student,roleIds:['a','b']};
 assert.equal(m.canViewPage(u,roles,'Applications'),true);
 assert.equal(m.hasPermission(u,roles,'applications.approve'),false);
 assert.equal(m.hasPermission(u,roles,'stipends.verify'),true);
 assert.equal(m.hasPermission(u,roles,'stipends.release'),false);
 assert.equal(m.canViewPage(u,roles,'Stipends'),false);
});
test('revocation and missing identities fail closed',()=>{
 assert.equal(m.hasPermission(student,[],'overview.view'),false);
 assert.equal(m.canViewPage(undefined,m.demoRoles,'Overview'),false);
 assert.equal(m.canViewPage(admin,m.demoRoles,'unknown'),false);
 assert.equal(m.hasPermission({...student,roleIds:['missing']},m.demoRoles,'overview.view'),false);
 const roles=m.demoRoles.map(r=>({...r,permissions:r.permissions.filter(p=>p!=='messages.send')}));
 assert.equal(m.hasPermission(student,roles,'messages.send'),false);
 assert.equal(m.canViewPage(student,roles,'Messages'),true);
});
