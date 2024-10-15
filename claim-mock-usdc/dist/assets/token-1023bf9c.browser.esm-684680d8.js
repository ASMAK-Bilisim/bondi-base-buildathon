var W=Object.defineProperty;var w=(o,e,t)=>e in o?W(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var s=(o,e,t)=>(w(o,typeof e!="symbol"?e+"":e,t),t);import{H as l,B as u,a0 as y,N as C,n as T,A as b,o as E,aY as v,p as A,q as R,t as S,v as B,x as F,G as O,y as V,z as x,aZ as H,Q as g,F as I,I as i,T as d}from"./index-fb31cd4a.js";import{S as M}from"./erc-20-standard-10861ed4.browser.esm-faa116ba.js";class N{constructor(e,t){this.contractWrapper=e,this.events=t}async getAllHolderBalances(){const t=(await this.events.getEvents("Transfer")).map(r=>r.data),a={};return t.forEach(r=>{const c=r==null?void 0:r.from,n=r==null?void 0:r.to,p=r==null?void 0:r.value;c!==l&&(c in a||(a[c]=u.from(0)),a[c]=a[c].sub(p)),n!==l&&(n in a||(a[n]=u.from(0)),a[n]=a[n].add(p))}),Promise.all(Object.keys(a).map(async r=>({holder:r,balance:await y(this.contractWrapper.getProvider(),this.contractWrapper.address,a[r])})))}}const h=class h extends M{constructor(t,a,r){let c=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{},n=arguments.length>4?arguments[4]:void 0,p=arguments.length>5?arguments[5]:void 0,m=arguments.length>6&&arguments[6]!==void 0?arguments[6]:new T(t,a,n,c,r);super(m,r,p);s(this,"mint",i(async t=>this.erc20.mint.prepare(t)));s(this,"mintTo",i(async(t,a)=>this.erc20.mintTo.prepare(t,a)));s(this,"mintBatchTo",i(async t=>this.erc20.mintBatchTo.prepare(t)));s(this,"delegateTo",i(async t=>d.fromContractWrapper({contractWrapper:this.contractWrapper,method:"delegate",args:[await g(t)]})));s(this,"burn",i(t=>this.erc20.burn.prepare(t)));s(this,"burnFrom",i(async(t,a)=>this.erc20.burnFrom.prepare(t,a)));this.abi=b.parse(n||[]),this.metadata=new E(this.contractWrapper,v,this.storage),this.app=new A(this.contractWrapper,this.metadata,this.storage),this.roles=new R(this.contractWrapper,h.contractRoles),this.sales=new S(this.contractWrapper),this.events=new B(this.contractWrapper),this.history=new N(this.contractWrapper,this.events),this.encoder=new F(this.contractWrapper),this.estimator=new O(this.contractWrapper),this.platformFees=new V(this.contractWrapper),this.interceptor=new x(this.contractWrapper),this.signature=new H(this.contractWrapper,this.roles)}async getVoteBalance(){return await this.getVoteBalanceOf(await this.contractWrapper.getSignerAddress())}async getVoteBalanceOf(t){return await this.erc20.getValue(await this.contractWrapper.read("getVotes",[t]))}async getDelegation(){return await this.getDelegationOf(await this.contractWrapper.getSignerAddress())}async getDelegationOf(t){return await this.contractWrapper.read("delegates",[await g(t)])}async isTransferRestricted(){return!await this.contractWrapper.read("hasRole",[I("transfer"),l])}async getMintTransaction(t,a){return this.erc20.getMintTransaction(t,a)}async prepare(t,a,r){return d.fromContractWrapper({contractWrapper:this.contractWrapper,method:t,args:a,overrides:r})}async call(t,a,r){return this.contractWrapper.call(t,a,r)}};s(h,"contractRoles",C);let f=h;export{f as Token};
