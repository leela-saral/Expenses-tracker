const KEY="pennywiseTransactions";
const $=s=>document.querySelector(s);
const form=$("#form"), message=$("#message"), list=$("#list"), empty=$("#empty");
const currency=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
$("#date").value=new Date().toISOString().slice(0,10);
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []}}
function write(items){try{localStorage.setItem(KEY,JSON.stringify(items));return true}catch{message.textContent="Could not save data in this browser.";return false}}
function icon(category){return ({Food:"🍜",Transport:"🚌",Education:"📚",Shopping:"🛍️",Bills:"🧾",Salary:"💼",Allowance:"💵",Other:"✨"})[category]||"✨"}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function render(){
 const all=read().sort((a,b)=>b.createdAt-a.createdAt), filter=$("#filter").value;
 const visible=filter==="all"?all:all.filter(x=>x.type===filter);
 const income=all.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0);
 const expenses=all.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);
 $("#balance").textContent=currency.format(income-expenses);$("#income").textContent=currency.format(income);$("#expenses").textContent=currency.format(expenses);
 $("#count").textContent=`${all.length} ${all.length===1?"record":"records"}`;list.replaceChildren();empty.hidden=visible.length>0;
 empty.textContent=all.length?"No transactions match this filter.":"No transactions yet. Add your first record to get started. ✨";
 visible.forEach(x=>{
  const row=el("article","transaction"), emoji=el("div","emoji",icon(x.category));emoji.setAttribute("aria-hidden","true");
  const details=el("div","details");details.append(el("strong","",x.description),el("small","",`${x.category} · ${new Date(x.date+"T12:00:00").toLocaleDateString()}`));
  const right=el("div","right"), amount=el("div",`amount ${x.type}`,`${x.type==="income"?"+":"−"}${currency.format(x.amount)}`);
  const del=el("button","delete","Delete");del.type="button";del.addEventListener("click",()=>remove(x.id));right.append(amount,del);row.append(emoji,details,right);list.append(row);
 });
}
form.addEventListener("submit",e=>{
 e.preventDefault();const description=$("#description").value.trim(),amount=Number($("#amount").value),date=$("#date").value;
 if(!description||!Number.isFinite(amount)||amount<=0||!date){message.textContent="Enter a description, positive amount, and date.";return}
 const items=read();items.push({id:Date.now()+"-"+Math.random().toString(16).slice(2),description,amount,type:$("#type").value,category:$("#category").value,date,createdAt:Date.now()});
 if(write(items)){form.reset();$("#date").value=new Date().toISOString().slice(0,10);message.textContent="Transaction added successfully!";render()}
});
function remove(id){if(write(read().filter(x=>x.id!==id))){message.textContent="Transaction deleted.";render()}}
$("#filter").addEventListener("change",render);
$("#clear").addEventListener("click",()=>{if(!read().length){message.textContent="There are no transactions to clear.";return}if(confirm("Delete all transactions? This cannot be undone.")&&write([])){message.textContent="All transactions cleared.";render()}});
render();