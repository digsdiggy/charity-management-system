
const supabaseUrl =
"https://znyuerdomemylbcnkwig.supabase.co";


const supabaseKey =
"sb_publishable_nGta9okMrOJc_fUHXxMo_w_QVPooTB1";


const supabaseClient = supabase.createClient(
supabaseUrl,
supabaseKey
);



let currentProfile;



////////////////////////////////////////////////////////


//////////////////////////////////////




//showLogin();




document.getElementById("loginButton").onclick = function(){
    alert("BUTTON CONNECTED");
    login();
};

//////////////////////////////////////////////////////////////////////
async function login() {

    alert("1");

    const { data, error } =
    await supabaseClient.auth.signInWithPassword({
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
    });

    alert("2");

    if (error) {
        alert(error.message);
        return;
    }

    alert("3");

    await loadProfile();

    alert("4");
}
///////////////////////////////////////////


//////////////////////////////////////////////////////////////////
async function loadProfile() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    console.log("User:", user);
    console.log("User error:", userError);

    if (userError || !user) {
        alert("No authenticated user.");
        return;
    }

    const result = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("uuid", user.id);

    console.log("Result:", result);
    alert(JSON.stringify(result));

    if (result.error) {
        alert(result.error.message);
        return;
    }

    if (!result.data || result.data.length === 0) {
        alert("No profile record found.");
        return;
    }

    currentProfile = result.data[0];

    document.getElementById("welcome").textContent =
        `Welcome ${currentProfile.first_name} ${currentProfile.last_name}`;

    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    document.getElementById("roleDisplay").textContent =
        `Role: ${currentProfile.role_name}`;

    buildMenu(currentProfile.role_name);

    await loadProjectDropdowns();
    await loadTransactionTypes();

    showPage("dashboard");
}


//////////////////////////////////////////////////////////////////////////////////////

function buildMenu(role){


let menu="";



if (role === "Admin") {

    menu += `
        <button onclick="showPage('dashboard')">Dashboard</button>
        <button onclick="showPage('users')">Users</button>
        <button onclick="showPage('trustees')">Trustees</button>
        <button onclick="showPage('meetings')">Meetings</button>
        <button onclick="showPage('finance')">Finance</button>
        <button onclick="showPage('projects')">Projects</button>
        <button onclick="showPage('audit')">Audit</button>
        <button onclick="showPage('beneficiaries')">Beneficiaries
</button>

<button onclick="showPage('outreach')">
Community Outreach
</button>

<button onclick="showPage('technology')">
Technology Support
</button>

<button onclick="showPage('assets')">
Assets
</button>

<button onclick="showPage('grants')">
Grants
</button>

<button onclick="showPage('documents')">
Documents
</button>

<button onclick="showPage('reports')">
Reports
</button>
    `;

}



if(role==="Secretary"){
menu +=`
<button onclick="showPage('meetings')">
Meetings
</button>

<button onclick="showPage('projects')">
Projects (Read)
</button>

`;

}

if(role==="Accounts Manager"){

menu +=`

<button onclick="showPage('finance')">Finance</button>
<button onclick="showPage('projects')">Projects (Read)</button>

`;

}



if(role==="Project Manager"){


menu +=`

<button onclick="showPage('projects')">
Projects
</button>


<button onclick="showPage('beneficiaries')">
Beneficiaries
</button>

`;

}

if(role==="Trustee"){

menu +=`

<button onclick="showPage('meetings')">
Meetings (Read)
</button>


<button onclick="showPage('projects')">
Projects (Read)
</button>

`;

}

document
.getElementById("menu")
.innerHTML=menu;


}


/////////////////////////////////////////////////

///////////////////////////////////////////////////////////////


async function logout(){


await supabaseClient.auth.signOut();


document
.getElementById("app")
.classList.add("hidden");


document
.getElementById("loginBox")
.classList.remove("hidden");


}
////////////////////////////////////////////////////////////

async function changePassword(){


let password=
prompt(
"Enter new password"
);



const {error}=

await supabaseClient.auth
.updateUser({

password

});



if(error)

alert(error.message);


else

alert(
"Password changed"
);


}
/////////////////////////////////////////////////////////////////
async function loadUsers(){


const {data,error}=

await supabaseClient
.from("profiles")
.select("*")
.order("created_at",{ascending:false});



if(error){

alert(error.message);
return;

}



let rows="";


data.forEach(user=>{


rows += `

<tr>

<td>${user.first_name || ""}</td>

<td>${user.last_name || ""}</td>

<td>${user.date_of_birth || ""}</td>

<td>${user.email || ""}</td>

<td>${user.phone_number || ""}</td>

<td>${user.address_line_1 || ""}</td>

<td>${user.address_line_2 || ""}</td>

<td>${user.town || ""}</td>

<td>${user.county || ""}</td>

<td>${user.postcode || ""}</td>

<td>${user.country || ""}</td>

<td>${user.role_name || ""}</td>

<td>${user.responsibility || ""}</td>

<td>

<button onclick="editUser('${user.uuid}')">
Edit
</button>

<button onclick="deleteUser('${user.uuid}')">
Delete
</button>

</td>

</tr>

`;
});


document
.getElementById("usersTable")
.innerHTML=rows;


}
/////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
async function createUser(){

const roleSelect =
document.getElementById("newRole");


const userData={

first_name:
document.getElementById("newFirstName").value,

last_name:
document.getElementById("newLastName").value,

email:
document.getElementById("newEmail").value,

phone_number:
document.getElementById("newPhone").value,


address_line_1:
document.getElementById("newAddress1").value,

address_line_2:
document.getElementById("newAddress2").value,

town:
document.getElementById("newTown").value,

county:
document.getElementById("newCounty").value,

postcode:
document.getElementById("newPostcode").value,

country:
document.getElementById("newCountry").value,


date_of_birth:
document.getElementById("newDOB").value,


role_id:
roleSelect.value,


role_name:
roleSelect.options[
roleSelect.selectedIndex
].text,


responsibility:
document.getElementById("newResponsibility").value

};

const {data,error}=await supabaseClient.functions.invoke(
"create-user",
{
body:userData
}
);


if(error){

alert(error.message);
return;

}

loadUsers();

}
/////////////////////////////////////////////////////////////////////
async function deleteUser(uuid){

let confirmDelete =
confirm("Delete this user?");

if(!confirmDelete)
return;


const { data:user } = await supabaseClient
.from("profiles")
.select("*")
.eq("uuid", uuid)
.maybeSingle();


const { error } = await supabaseClient
.from("profiles")
.delete()
.eq("uuid", uuid);


if(error){

alert(error.message);
return;

}


await createAuditLog(
"DELETE",
"profiles",
"Deleted user " + (user?.email || "")
);


loadUsers();

}
///////////////////////////////////////////////////////////
async function createAuditLog(
action,
table,
description
){

const {
data:{user}
}=await supabaseClient.auth.getUser();


await supabaseClient
.from("audit_logs")
.insert({
    id: user.id,
    user_email: user.email,
    action: action,
    table_name: table,
    description: description
});


}
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////
window.onload = function(){

loadRoles();
loadProjectDropdowns();
loadTransactionTypes();

};

//////////////////////////////////////////////

async function loadAdminDashboard(){


const users =
await supabaseClient
.from("profiles")
.select("*",{count:"exact",head:true});



const trustees =
await supabaseClient
.from("trustees")
.select("*",{count:"exact",head:true});



const meetings =
await supabaseClient
.from("meetings")
.select("*",{count:"exact",head:true});



const projects =
await supabaseClient
.from("project")
.select("*",{count:"exact",head:true});



const audit =
await supabaseClient
.from("audit_logs")
.select("*",{count:"exact",head:true});




const finance =
await supabaseClient
.from("transactions")
.select("amount");



let total=0;


finance.data.forEach(item=>{

total += Number(item.amount || 0);

});




document.getElementById("userCount")
.innerHTML =
users.count || 0;



document.getElementById("trusteeCount")
.innerHTML =
trustees.count || 0;



document.getElementById("meetingCount")
.innerHTML =
meetings.count || 0;



document.getElementById("projectCount")
.innerHTML =
projects.count || 0;



document.getElementById("auditCount")
.innerHTML =
audit.count || 0;



document.getElementById("financeTotal")
.innerHTML =
"£" + total.toLocaleString();


}
//////////////////////////////////////


//////////////////////////////////////////
async function loadRoles(){

const {data,error}=await supabaseClient
.from("role")
.select("id, role_name")
.order("role_name");


if(error){

console.error(error);

alert(error.message);

return;

}



let options="";


data.forEach(role=>{


options += `

<option value="${role.id}">
${role.role_name}
</option>

`;


});



document.getElementById("newRole").innerHTML = options;


}

//////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////
async function deleteMeeting(id){

console.log("Deleting meeting:", id);

let confirmDelete = confirm("Delete this meeting?");

if(!confirmDelete)
return;


const {data,error}=await supabaseClient
.from("meetings")
.delete()
.eq("id",id)
.select();


console.log("DELETE RESULT:", data);
console.log("DELETE ERROR:", error);


if(error){

alert(error.message);
return;

}


alert("Meeting deleted");

loadMeetings();

createAuditLog(
"DELETE",
"meetings",
"Deleted meeting ID "+id
);

}

/////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
function showPage(page){

    // Hide every page
    document.querySelectorAll(".page").forEach(function(section){
        section.classList.add("hidden");
    });

    // Show the selected page
    document.getElementById(page).classList.remove("hidden");

    // Load data
    if(page==="dashboard") loadAdminDashboard();
    if(page==="users") {

loadRoles();

loadUsers();

}

    if(page==="trustees") loadTrustees();
    if(page==="meetings") loadMeetings();
 // if(page==="finance"){
//    loadTransactions();
//    loadTransactionCategories(1);
//}
 if(page==="finance") {

    loadTransactionTypes();
    loadTransactions();

} 
    if(page==="projects") loadProjects();
  if(page==="beneficiaries") loadBeneficiaries();

if(page==="outreach") loadOutreach();

if(page==="technology") loadTechnology();

if(page==="assets") loadAssets();

if(page==="grants") loadGrants();

if(page==="documents") loadDocuments();

if(page==="reports") loadReports();
    if(page==="audit") loadAuditLogs();
}
////////////////////////////////////////////////////////////////////////
async function addProject(){


const {
data:{user}
}=await supabaseClient.auth.getUser();



const project={


project_code:
document.getElementById("projectCode").value,


project_name:
document.getElementById("projectName").value,


description:
document.getElementById("projectDescription").value,


project_type:
document.getElementById("projectType").value,


status_type:
document.getElementById("projectStatus").value,


start_date:
document.getElementById("startDate").value,


planned_end_date:
document.getElementById("plannedEndDate").value,


location:
document.getElementById("projectLocation").value,


project_manager:
document.getElementById("projectManager").value,


grant_reference:
document.getElementById("grantReference").value,


donor_name:
document.getElementById("donorName").value,


created_by:
user.id,
  


approved_by:
user.id,


created_at:
new Date()


};



const { data, error } = await supabaseClient
    .from("project")
    .insert(project)
    .select();

console.log("DATA:", data);
console.log("ERROR:", error);

if (error) {
    console.error(error);
    alert(JSON.stringify(error));
    return;
}


alert("Project created successfully");


loadProjects();



createAuditLog(
"CREATE",
"project",
"Created project "+project.project_name
);


}
/////////////////////////////////////////////////////////////////////
async function loadTransactionTypes(){

console.log("START loading transaction types");


const {data,error}=await supabaseClient
.from("transaction_types")
.select("id,name")
.order("id");


console.log("DATA:",data);
console.log("ERROR:",error);


if(error){
    alert(error.message);
    return;
}


let options=`<option value="">Select Type</option>`;


data.forEach(type=>{

options += `
<option value="${type.id}">
${type.name}
</option>
`;

});


document.getElementById("transactionType").innerHTML=options;


console.log("Transaction dropdown updated");

}
/////////////////////////////////////////

////////////////////////////////////////////////////////
async function deleteProject(id){


let confirmDelete =
confirm(
"Delete this project?"
);



if(!confirmDelete)
return;



const {error}=

await supabaseClient
.from("project")
.delete()
.eq("id",id);



if(error){

alert(error.message);

return;

}



alert("Project deleted");


loadProjects();



createAuditLog(
"DELETE",
"project",
"Deleted project ID "+id
);


}
///////////////////////////////////////////////////////////
async function addTrustee(){


const trustee={


first_name:
document.getElementById("trusteeFirstName").value,


last_name:
document.getElementById("trusteeLastName").value,


email:
document.getElementById("trusteeEmail").value,


phone_number:
document.getElementById("trusteePhone").value,


date_of_birth:
document.getElementById("trusteeDOB").value,


address_line1:
document.getElementById("trusteeAddress1").value,

address_line2:
document.getElementById("trusteeAddress2").value,

town:
document.getElementById("trusteeTown").value,

county:
document.getElementById("trusteeCounty").value,

postcode:
document.getElementById("trusteePostcode").value,

country:
document.getElementById("trusteeCountry").value,

role_type:
document.getElementById("trusteeRole").value,


status:
document.getElementById("trusteeStatus").value,


joined_date:
new Date()


};



const {error}=

await supabaseClient
.from("trustees")
.insert(trustee);



if(error){

alert(error.message);

return;

}



alert("Trustee added successfully");


loadTrustees();



createAuditLog(
"CREATE",
"trustees",
"Created trustee "+trustee.first_name+" "+trustee.last_name
);


}
////////////////////////////////
async function loadTrustees(){


const {data,error}=await supabaseClient
.from("trustees")
.select("*")
.order("id",{ascending:false});



if(error){

alert(error.message);
return;

}



let rows="";



data.forEach(t=>{


rows += `

<tr>

<td>${t.first_name || ""}</td>

<td>${t.last_name || ""}</td>

<td>${t.email || ""}</td>

<td>${t.phone_number || ""}</td>

<td>${t.date_of_birth || ""}</td>

<td>${t.address_line1 || ""}</td>

<td>${t.address_line2 || ""}</td>

<td>${t.town || ""}</td>

<td>${t.county || ""}</td>

<td>${t.postcode || ""}</td>

<td>${t.country || ""}</td>

<td>${t.role_type || ""}</td>

<td>${t.status || ""}</td>

<td>

<button onclick="editTrustee(${t.id})">
Edit
</button>

<button onclick="deleteTrustee(${t.id})">
Delete
</button>

</td>


</tr>

`;

});



document.getElementById("trusteeTable").innerHTML=rows;


}

//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
async function deleteTrustee(id){


let confirmDelete =
confirm(
"Delete this trustee?"
);



if(!confirmDelete)
return;



const {error}=

await supabaseClient
.from("trustees")
.delete()
.eq("id",id);



if(error){

alert(error.message);

return;

}



alert("Trustee deleted");


loadTrustees();



createAuditLog(
"DELETE",
"trustees",
"Deleted trustee ID "+id
);


}
/////////////////////////////////////////////////////////////
async function addMeeting(){


const {
data:{user}
}=await supabaseClient.auth.getUser();



const meeting={


title:
document.getElementById("meetingTitle").value,


meeting_date:
document.getElementById("meetingDate").value,


location:
document.getElementById("meetingLocation").value,


attendees:
document.getElementById("meetingAttendees").value,


minutes:
document.getElementById("meetingMinutes").value,


decisions:
document.getElementById("meetingDecisions").value,


created_by: user.id,


created_at:
new Date()


};



const {error}=

await supabaseClient
.from("meetings")
.insert(meeting);



if(error){

alert(error.message);

return;

}



alert("Meeting created successfully");



loadMeetings();



createAuditLog(
"CREATE",
"meetings",
"Created meeting "+meeting.title
);


}
///////////////////////////////////////////////////////////
async function loadMeetings(){


const {data,error}=

await supabaseClient
.from("meetings")
.select("*")
.order("id",{ascending:false});



if(error){

alert(error.message);

return;

}



let rows="";



data.forEach(m=>{


rows+=`

<tr>

<td>
${m.title || ""}
</td>


<td>
${m.meeting_date || ""}
</td>


<td>
${m.location || ""}
</td>


<td>
${m.attendees || ""}
</td>


<td>
${m.minutes || ""}
</td>


<td>
${m.decisions || ""}
</td>


<td>

<button onclick="editMeeting('${m.id}')">
Edit
</button>


<button onclick="deleteMeeting('${m.id}')">
Delete
</button>


</td>


</tr>

`;

});



document
.getElementById("meetingTable")
.innerHTML=rows;


}
///////////////////////////////////////////

///////////////////////////////////////////////////////
async function addTransaction(){


const {
data:{user}
}=await supabaseClient.auth.getUser();



const transaction={

type:
document.getElementById("transactionType")
.options[
document.getElementById("transactionType").selectedIndex
].text,


category:
document.getElementById("transactionCategory").value,


description:
document.getElementById("transactionDescription").value,


amount:
Number(document.getElementById("transactionAmount").value),


transaction_date:
document.getElementById("transactionDate").value,


organisation:
document.getElementById("organisation").value,


address:
document.getElementById("transactionAddress").value,


phone_number:
document.getElementById("transactionPhone").value,


email:
document.getElementById("transactionEmail").value,


created_by:user.id,

created_at:new Date()


};



const {error}=

await supabaseClient
.from("transactions")
.insert(transaction);



if(error){

alert(error.message);

return;

}



alert("Transaction saved");


loadTransactions();



createAuditLog(
"CREATE",
"transactions",
"Created transaction "+transaction.description
);


}
//////////////////////////////////////////////////
async function loadTransactions(){

const {data,error}=await supabaseClient
.from("transactions")
.select("*")
.order("id",{ascending:false});


if(error){
alert(error.message);
return;
}


let rows="";


data.forEach(t=>{

rows+=`

<tr>

<td>
${t.type || ""}
</td>

<td>
${t.category || ""}
</td>

<td>
${t.description || ""}
</td>

<td>
£${t.amount || 0}
</td>

<td>
${t.transaction_date || ""}
</td>

<td>
${t.organisation || ""}
</td>

<td>
${t.address || ""}
</td>

<td>
${t.phone_number || ""}
</td>

<td>
${t.email || ""}
</td>

<td>

<button onclick="editTransaction(${t.id})">
Edit
</button>

<button onclick="deleteTransaction(${t.id})">
Delete
</button>

</td>

</tr>

`;

});


document
.getElementById("transactionTable")
.innerHTML=rows;

}
////////////////////////////////////////////////////////
async function deleteTransaction(id){


let confirmDelete =
confirm(
"Delete this transaction?"
);



if(!confirmDelete)
return;



const {error}=

await supabaseClient
.from("transactions")
.delete()
.eq("id",id);



if(error){

alert(error.message);

return;

}



alert("Transaction deleted");


loadTransactions();



createAuditLog(
"DELETE",
"transactions",
"Deleted transaction ID "+id
);


}
/////////////////////////////////////////////////////////
async function loadAuditLogs(){


const {data,error}=

await supabaseClient
.from("audit_logs")
.select("*")
.order("new_id",{ascending:false});


if(error){

alert(error.message);

return;

}



let rows="";



data.forEach(log=>{


rows+=`

<tr>


<td>
${new Date(log.created_at).toLocaleString()}
</td>


<td>
${log.user_email || ""}
</td>


<td>
${log.action || ""}
</td>


<td>
${log.table_name || ""}
</td>


<td>
${log.description || ""}
</td>


</tr>

`;

});



document
.getElementById("auditTable")
.innerHTML=rows;


}
/////////////////////////////////////
async function editProject(id){


const {data,error}=

await supabaseClient
.from("project")
.select("*")
.eq("id",id)
.maybeSingle();



if(error){

alert(error.message);

return;

}



let name =
prompt(
"Project name:",
data.project_name
);



if(!name)
return;



const {error:updateError}=

await supabaseClient
.from("project")
.update({

project_name:name

})
.eq("id",id);



if(updateError){

alert(updateError.message);

return;

}



alert("Project updated");


loadProjects();



createAuditLog(
"UPDATE",
"project",
"Updated project "+name
);


}
/////////////////////////////////////////////////////////////////////////////
async function editTrustee(id){


const {data,error}=

await supabaseClient
.from("trustees")
.select("*")
.eq("id",id)
.single();



if(error){

alert(error.message);

return;

}



let firstName =
prompt(
"First name:",
data.first_name
);



if(firstName===null)
return;



let lastName =
prompt(
"Last name:",
data.last_name
);



if(lastName===null)
return;



let email =
prompt(
"Email:",
data.email
);



let phone =
prompt(
"Phone number:",
data.phone_number
);



let role =
prompt(
"Role:",
data.role_type
);



let status =
prompt(
"Status:",
data.status
);



const {error:updateError}=

await supabaseClient
.from("trustees")
.update({

first_name:firstName,

last_name:lastName,

email:email,

phone_number:phone,

role_type:role,

status:status

})
.eq("id",id);



if(updateError){

alert(updateError.message);

return;

}



alert("Trustee updated successfully");



loadTrustees();



createAuditLog(
"UPDATE",
"trustees",
"Updated trustee "+firstName+" "+lastName
);


}
/////////////////////////////////////////////////////////////////////

async function editMeeting(id){

console.log("Editing meeting:", id);

const {data,error}=

await supabaseClient
.from("meetings")
.select("*")
.eq("id",id)
.single();



if(error){

alert(error.message);

return;

}



let title =
prompt(
"Meeting title:",
data.title
);



if(title===null)
return;



let date =
prompt(
"Meeting date:",
data.meeting_date
);



let location =
prompt(
"Location:",
data.location
);



let attendees =
prompt(
"Attendees:",
data.attendees
);



let minutes =
prompt(
"Minutes:",
data.minutes
);



let decisions =
prompt(
"Decisions:",
data.decisions
);



const {error:updateError}=

await supabaseClient
.from("meetings")
.update({

title:title,

meeting_date:date,

location:location,

attendees:attendees,

minutes:minutes,

decisions:decisions

})
.eq("id",id);



if(updateError){

alert(updateError.message);

return;

}



alert("Meeting updated successfully");



loadMeetings();



createAuditLog(
"UPDATE",
"meetings",
"Updated meeting "+title
);


}
/////////////////////////////////////////////////////////
async function editTransaction(id){

const {data,error}=await supabaseClient
.from("transactions")
.select("*")
.eq("id",id)
.single();


if(error){

alert(error.message);
return;

}


let type = prompt(
"Transaction type:",
data.type
);

if(type===null)
return;


let category = prompt(
"Category:",
data.category
);


let description = prompt(
"Description:",
data.description
);


let amount = prompt(
"Amount:",
data.amount
);


let date = prompt(
"Transaction date:",
data.transaction_date
);


let organisation = prompt(
"Organisation:",
data.organisation
);


let address = prompt(
"Address:",
data.address
);


let phone = prompt(
"Phone:",
data.phone_number
);


let email = prompt(
"Email:",
data.email
);



const {error:updateError}=await supabaseClient
.from("transactions")
.update({

type:type,

category:category,

description:description,

amount:Number(amount),

transaction_date:date,

organisation:organisation,

address:address,

phone_number:phone,

email:email

})
.eq("id",id);



if(updateError){


return;

}






loadTransactions();


createAuditLog(
"UPDATE",
"transactions",
"Updated transaction "+description
);


}

//////////////////////////////////////////////////////////
async function loadProjects(){


const {data,error}=await supabaseClient
.from("project")
.select(`
*,
project_type(name),
status_type(name)
`)
.order("id",{ascending:false});



if(error){

alert(error.message);
return;

}



let rows="";


data.forEach(p=>{


rows += `

<tr>

<td>${p.project_code || ""}</td>

<td>${p.project_name || ""}</td>

<td>${p.description || ""}</td>

<td>${p.project_type?.name || ""}</td>

<td>${p.status_type?.name || ""}</td>

<td>${p.location || ""}</td>

<td>${p.project_manager || ""}</td>

<td>${p.donor_name || ""}</td>

<td>${p.grant_reference || ""}</td>

<td>${p.start_date || ""}</td>

<td>${p.planned_end_date || ""}</td>


<td>

<button onclick="editProject(${p.id})">
Edit
</button>


<button onclick="deleteProject(${p.id})">
Delete
</button>


</td>


</tr>

`;

});


document.getElementById("projectTable").innerHTML=rows;


}
/////////////////////////////////////////////////////////////////////
async function loadProjectDropdowns(){



const {data:types,error:typeError}=await supabaseClient
.from("project_type")
.select("*");


console.log("PROJECT TYPES", types);
console.log("PROJECT ERROR", typeError);


if(typeError){
alert(typeError.message);
return;
}


const {data:statuses,error:statusError}=await supabaseClient
.from("status_type")
.select("*");


console.log("STATUS TYPES", statuses);
console.log("STATUS ERROR", statusError);


if(statusError){
alert(statusError.message);
return;
}


alert("Dropdown data loaded");


document.getElementById("projectType").innerHTML =
types.map(t=>`
<option value="${t.id}">
${t.name}
</option>
`).join("");


document.getElementById("projectStatus").innerHTML =
statuses.map(s=>`
<option value="${s.id}">
${s.name}
</option>
`).join("");

}
//////////////////////////////////////////
async function loadTransactionCategories(){

const typeId =
document.getElementById("transactionType").value;


alert("Selected Type ID = " + typeId);


const {data,error}=await supabaseClient
.from("transaction_categories")
.select("*")
.eq("type_id", typeId)
.order("name");


console.log("CATEGORY DATA:", data);
console.log("CATEGORY ERROR:", error);


if(error){

alert(error.message);
return;

}


let options =
`
<option value="">
Select Category
</option>
`;


data.forEach(category=>{

options +=
`
<option value="${category.name}">
${category.name}
</option>
`;

});


document.getElementById("transactionCategory").innerHTML = options;


}
//////////////////////////////////////////////////////////////
async function addBeneficiary() {

    const {
        data:{user}
    } = await supabaseClient.auth.getUser();


    const beneficiary = {

        full_name:
        document.getElementById("beneficiaryName").value,


        email:
        document.getElementById("beneficiaryEmail").value,


        mobile_phone:
        document.getElementById("beneficiaryMobile").value,


        date_of_birth:
        document.getElementById("beneficiaryDOB").value,


        address_line_1:
        document.getElementById("beneficiaryAddress1").value,


        address_line_2:
        document.getElementById("beneficiaryAddress2").value,


        town:
        document.getElementById("beneficiaryTown").value,


        county:
        document.getElementById("beneficiaryCounty").value,


        postcode:
        document.getElementById("beneficiaryPostcode").value,


        country:
        document.getElementById("beneficiaryCountry").value,


        support_required:
        document.getElementById("beneficiaryNeed").value,


        project:
        document.getElementById("beneficiaryProject").value,


        created_by:user.id

    };



    const {error}=await supabaseClient
    .from("beneficiaries")
    .insert(beneficiary);



    if(error){

        alert(error.message);
        return;

    }


    alert("Beneficiary saved successfully");


    loadBeneficiaries();


    createAuditLog(
        "CREATE",
        "beneficiaries",
        "Created beneficiary "+beneficiary.full_name
    );

}

///////////////////////////////////////////////////////////////////////
async function loadBeneficiaries(){


    const {data,error}=await supabaseClient
    .from("beneficiaries")
    .select("*")
    .order("id",{ascending:false});



    if(error){

        alert(error.message);
        return;

    }



    let rows="";



    data.forEach(item=>{


        rows += `

<tr>

<td>${item.full_name || ""}</td>

<td>${item.email || ""}</td>

<td>${item.mobile_phone || ""}</td>

<td>${item.date_of_birth || ""}</td>

<td>${item.address_line_1 || ""}</td>

<td>${item.address_line_2 || ""}</td>

<td>${item.town || ""}</td>

<td>${item.county || ""}</td>

<td>${item.postcode || ""}</td>

<td>${item.country || ""}</td>

<td>${item.support_required || ""}</td>

<td>${item.project || ""}</td>


<td>

<button onclick="editBeneficiary(${item.id})">
Edit
</button>


<button onclick="deleteBeneficiary(${item.id})">
Delete
</button>


</td>


</tr>

`;

    });



    document.getElementById("beneficiaryTable").innerHTML=rows;


}

///////////////////////////
async function deleteBeneficiary(id){

    if(!confirm("Delete beneficiary?"))
        return;

    const {error} =
    await supabaseClient
    .from("beneficiaries")
    .delete()
    .eq("id",id);

    if(error){
        alert(error.message);
        return;
    }

    loadBeneficiaries();

    createAuditLog(
        "DELETE",
        "beneficiaries",
        "Deleted beneficiary "+id
    );

}
//////////////////////////////////////////////////////////////////
async function editBeneficiary(id){


const {data,error}=await supabaseClient
.from("beneficiaries")
.select("*")
.eq("id",id)
.single();



if(error){

alert(error.message);
return;

}



let name = prompt(
"Name:",
data.full_name
);


if(name===null)
return;



let email = prompt(
"Email:",
data.email
);



let mobile = prompt(
"Mobile Phone:",
data.mobile_phone
);



let support = prompt(
"Support Required:",
data.support_required
);



let project = prompt(
"Project:",
data.project
);



const {error:updateError}=await supabaseClient
.from("beneficiaries")
.update({

full_name:name,

email:email,

mobile_phone:mobile,

support_required:support,

project:project

})
.eq("id",id);



if(updateError){

alert(updateError.message);
return;

}



alert("Beneficiary updated");


loadBeneficiaries();


createAuditLog(
"UPDATE",
"beneficiaries",
"Updated beneficiary "+name
);


}

//////////////////////////////////////////////////////////////////////////
async function addTechnicalIssue(){

    const {
        data:{user}
    } = await supabaseClient.auth.getUser();

    const {error} = await supabaseClient
    .from("technology_support")
    .insert({

        issue_title:
        document.getElementById("issueTitle").value,

        reported_by:
        document.getElementById("reportedBy").value,

        device:
        document.getElementById("device").value,

        priority:
        document.getElementById("issuePriority").value,

        status:
        document.getElementById("issueStatus").value,

        resolution:
        document.getElementById("resolution").value,

        created_by:user.id

    });

    if(error){

        alert(error.message);
        return;

    }

    alert("Issue logged.");

    loadTechnology();

    createAuditLog(
        "CREATE",
        "technology_support",
        "Created technology support issue"
    );

}
///////////////////////////////////////////////////////////////////////////////////////////
async function loadTechnology(){

    const {data,error}=await supabaseClient
    .from("technology_support")
    .select("*")
    .order("id",{ascending:false});

    if(error){

        alert(error.message);
        return;

    }

    let rows="";

    data.forEach(issue=>{

        rows+=`

<tr>

<td>${issue.issue_title}</td>

<td>${issue.reported_by}</td>

<td>${issue.device || ""}</td>

<td>${issue.priority || ""}</td>

<td>${issue.status}</td>

<td>${issue.resolution || ""}</td>

<td>

<button onclick="editTechnology(${issue.id})">
Edit
</button>

<button onclick="deleteTechnology(${issue.id})">
Delete
</button>

</td>

</tr>

`;

    });

    document.getElementById("technologyTable").innerHTML=rows;

}
/////////////////////////////////////////////////////////////////
async function deleteTechnology(id){

    if(!confirm("Delete this issue?"))
        return;

    const {error}=await supabaseClient
    .from("technology_support")
    .delete()
    .eq("id",id);

    if(error){

        alert(error.message);
        return;

    }

    loadTechnology();

    createAuditLog(
        "DELETE",
        "technology_support",
        "Deleted technology issue "+id
    );

}
///////////////////////////////////////////////////////
async function editTechnology(id){

    const {data,error}=await supabaseClient
    .from("technology_support")
    .select("*")
    .eq("id",id)
    .single();

    if(error){

        alert(error.message);
        return;

    }

    let title =
    prompt("Issue",data.issue_title);

    if(title===null)
        return;

    let status =
    prompt("Status",data.status);

    let resolution =
    prompt("Resolution",data.resolution);

    const {error:updateError}=await supabaseClient
    .from("technology_support")
    .update({

        issue_title:title,
        status:status,
        resolution:resolution

    })
    .eq("id",id);

    if(updateError){

        alert(updateError.message);
        return;

    }

    loadTechnology();

    createAuditLog(
        "UPDATE",
        "technology_support",
        "Updated technology issue "+title
    );

}
////////////////////////////////////////////////////////////////////////
async function addAsset(){

    const {
        data:{user}
    } = await supabaseClient.auth.getUser();

    const {error}=await supabaseClient
    .from("assets")
    .insert({

        asset_name:
        document.getElementById("assetName").value,

        serial_number:
        document.getElementById("assetSerial").value,

        asset_type:
        document.getElementById("assetType").value,

        manufacturer:
        document.getElementById("assetManufacturer").value,

        model:
        document.getElementById("assetModel").value,

        location:
        document.getElementById("assetLocation").value,

        assigned_to:
        document.getElementById("assignedTo").value,

        purchase_date:
        document.getElementById("purchaseDate").value,

        purchase_price:
        Number(document.getElementById("purchasePrice").value),

        status:
        document.getElementById("assetStatus").value,

        notes:
        document.getElementById("assetNotes").value,

        created_by:user.id

    });

    if(error){

        alert(error.message);
        return;

    }

    alert("Asset saved.");

    loadAssets();

    createAuditLog(
        "CREATE",
        "assets",
        "Created asset"
    );

}
///////////////////////////////////////////////////////////////////////////
async function loadAssets(){

    const {data,error}=await supabaseClient
    .from("assets")
    .select("*")
    .order("id",{ascending:false});

    if(error){

        alert(error.message);
        return;

    }

    let rows="";

    data.forEach(asset=>{

        rows+=`

<tr>

<td>${asset.asset_name}</td>

<td>${asset.serial_number || ""}</td>

<td>${asset.asset_type || ""}</td>

<td>${asset.manufacturer || ""}</td>

<td>${asset.model || ""}</td>

<td>${asset.location || ""}</td>

<td>${asset.assigned_to || ""}</td>

<td>${asset.status}</td>

<td>

<button onclick="editAsset(${asset.id})">
Edit
</button>

<button onclick="deleteAsset(${asset.id})">
Delete
</button>

</td>

</tr>

`;

    });

    document.getElementById("assetTable").innerHTML=rows;

}
////////////////////////////////////////////////////////
async function deleteAsset(id){

    if(!confirm("Delete this asset?"))
        return;

    const {error}=await supabaseClient
    .from("assets")
    .delete()
    .eq("id",id);

    if(error){

        alert(error.message);
        return;

    }

    loadAssets();

    createAuditLog(
        "DELETE",
        "assets",
        "Deleted asset "+id
    );

}
/////////////////////////////////////////////////////////
async function editAsset(id){

    const {data,error}=await supabaseClient
    .from("assets")
    .select("*")
    .eq("id",id)
    .single();

    if(error){

        alert(error.message);
        return;

    }

    let name =
    prompt("Asset Name",data.asset_name);

    if(name===null)
        return;

    let location =
    prompt("Location",data.location);

    let status =
    prompt("Status",data.status);

    let assigned =
    prompt("Assigned To",data.assigned_to);

    const {error:updateError}=await supabaseClient
    .from("assets")
    .update({

        asset_name:name,

        location:location,

        status:status,

        assigned_to:assigned

    })
    .eq("id",id);

    if(updateError){

        alert(updateError.message);
        return;

    }

    loadAssets();

    createAuditLog(
        "UPDATE",
        "assets",
        "Updated asset "+name
    );

}
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////
// GRANTS AND FUNDING
/////////////////////////////////////////////////////


async function addGrant(){


const grant = {

grant_name:
document.getElementById("grantName").value,

donor:
document.getElementById("donor").value,

amount:
Number(document.getElementById("grantAmount").value),

start_date:
document.getElementById("grantStart").value,

end_date:
document.getElementById("grantEnd").value

};



const {error}=await supabaseClient
.from("grants")
.insert(grant);



if(error){

alert(error.message);
return;

}



alert("Grant saved successfully");


loadGrants();



createAuditLog(
"CREATE",
"grants",
"Created grant "+grant.grant_name
);



}
///////////////////////////////////////////////////////
async function loadGrants(){


const {data,error}=await supabaseClient
.from("grants")
.select("*")
.order("id",{ascending:false});



if(error){

alert(error.message);
return;

}



let rows="";



data.forEach(grant=>{


rows += `

<tr>

<td>
${grant.grant_name || ""}
</td>


<td>
${grant.donor || ""}
</td>


<td>
£${grant.amount || 0}
</td>


<td>
${grant.start_date || ""}
</td>

<td>
${grant.end_date || ""}
</td>
<td>

<button onclick="editGrant(${grant.id})">
Edit
</button>


<button onclick="deleteGrant(${grant.id})">
Delete
</button>


</td>



</tr>

`;



});



document
.getElementById("grantTable")
.innerHTML=rows;



}
///////////////////////////////////////////////
async function deleteGrant(id){

if(!confirm("Delete this grant?"))
return;


const {error}=await supabaseClient
.from("grants")
.delete()
.eq("id",id);


if(error){

alert(error.message);
return;

}


alert("Grant deleted");


loadGrants();


createAuditLog(
"DELETE",
"grants",
"Deleted grant ID "+id
);


}
///////////////////////////////////////////////////////////
async function editGrant(id){


const {data,error}=await supabaseClient
.from("grants")
.select("*")
.eq("id",id)
.single();


if(error){

alert(error.message);
return;

}


let name = prompt(
"Grant Name:",
data.grant_name
);

if(name===null)
return;


let donor = prompt(
"Donor:",
data.donor
);


let amount = prompt(
"Amount:",
data.amount
);


let start = prompt(
"Start Date:",
data.start_date
);


let end = prompt(
"End Date:",
data.end_date
);



const {error:updateError}=await supabaseClient
.from("grants")
.update({

grant_name:name,
donor:donor,
amount:Number(amount),
start_date:start,
end_date:end

})
.eq("id",id);



if(updateError){

alert(updateError.message);
return;

}


alert("Grant updated");


loadGrants();


createAuditLog(
"UPDATE",
"grants",
"Updated grant "+name
);


}

///////////////////////////////////////////////////////////////////
async function addDocument(){

    // 1. Get the selected file
    const file = document.getElementById("documentFile").files[0];

    if (!file) {
        alert("Please select a file");
        return;
    }

    // 2. Get the logged-in user
    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    // 3. Create a unique filename
    const fileName = Date.now() + "_" + file.name;

    // 4. Upload the file to Storage
    const { data: uploadData, error: uploadError } =
    await supabaseClient
    .storage
    .from("charity-documents")
    .upload(fileName, file);

    console.log(uploadData);
    console.log(uploadError);

    if (uploadError) {
        alert(uploadError.message);
        return;
    }

    // 5. Insert the document record into the database
    const { error } = await supabaseClient
    .from("documents")
    .insert({
        document_name: document.getElementById("documentName").value,
        document_type: document.getElementById("documentType").value,
        file_url: uploadData.path,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: user.id
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Document uploaded successfully");
    loadDocuments();
}


/////////////////////////////////////////
async function loadDocuments() {

    const { data, error } = await supabaseClient
        .from("documents")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        alert(error.message);
        return;
    }

    let rows = "";

    data.forEach(doc => {

    console.log("Stored path:", doc.file_url);

    const { data: urlData } =
    supabaseClient.storage
    .from("charity-documents")
    .getPublicUrl(doc.file_url);

    console.log("Public URL:", urlData.publicUrl);

    rows += `
    <tr>

        <td>${doc.document_name || ""}</td>

        <td>${doc.document_type || ""}</td>

        <td>
            <a href="${urlData.publicUrl}" target="_blank">
                ${doc.file_name || "View"}
            </a>
        </td>

        <<td>

<button onclick="editDocument(${doc.id})">
    Edit
</button>


<button onclick="deleteDocument(${doc.id})">
    Delete
</button>

</td>


    </tr>
    `;
});


    document.getElementById("documentTable").innerHTML = rows;
}

/////////////////////////////////////////////
async function deleteDocument(id){


const confirmDelete =
confirm("Delete this document?");


if(!confirmDelete)
return;


const {error}=await supabaseClient
.from("documents")
.delete()
.eq("id",id);



if(error){

alert(error.message);

return;

}



loadDocuments();


createAuditLog(
"DELETE",
"documents",
"Deleted document ID "+id
);


}
//////////////////////////////////////////////
async function editDocument(id){

    const {data,error}=await supabaseClient
    .from("documents")
    .select("*")
    .eq("id",id)
    .single();


    if(error){

        alert(error.message);
        return;

    }


    let name = prompt(
        "Document Name:",
        data.document_name
    );


    if(name===null)
        return;


    let type = prompt(
        "Document Type:",
        data.document_type
    );


    const {error:updateError}=await supabaseClient
    .from("documents")
    .update({

        document_name:name,
        document_type:type

    })
    .eq("id",id);



    if(updateError){

        alert(updateError.message);
        return;

    }


    alert("Document updated successfully");


    loadDocuments();


    createAuditLog(
        "UPDATE",
        "documents",
        "Updated document "+name
    );

}

/////////////////////////////////////////////
//////////////////////////////////////////////////////
// COMMUNITY OUTREACH
//////////////////////////////////////////////////////

async function addOutreach(){


    const activity = {

        activity_name:
        document.getElementById("activityName").value,


        activity_date:
        document.getElementById("activityDate").value,


        location:
        document.getElementById("activityLocation").value,


        attendance:
        Number(document.getElementById("participants").value || 0),


        notes:
        document.getElementById("activityDescription").value

    };


    const {error}=await supabaseClient
    .from("community_outreach")
    .insert(activity);



    if(error){

        alert(error.message);
        console.log(error);
        return;

    }


    alert("Outreach activity saved successfully");


    loadOutreach();


    createAuditLog(
        "CREATE",
        "community_outreach",
        "Created outreach activity "+activity.activity_name
    );

}

////////////////////////////////////////////////////////////////////////

async function loadOutreach(){


    const {data,error}=await supabaseClient
    .from("community_outreach")
    .select("*")
    .order("id",{ascending:false});



    if(error){

        alert(error.message);
        console.log(error);
        return;

    }



    let rows="";



    data.forEach(item=>{


        rows += `

        <tr>

        <td>${item.activity_name || ""}</td>

        <td>${item.activity_date || ""}</td>

        <td>${item.location || ""}</td>

        <td>${item.attendance || 0}</td>

        <td>${item.notes || ""}</td>


       <td>

<button onclick="editOutreach(${item.id})">
Edit
</button>

<button onclick="deleteOutreach(${item.id})">
Delete
</button>

</td>


        </tr>

        `;


    });



    document.getElementById("outreachTable").innerHTML=rows;


}

/////////////////////////////////////////////////////////////////////////////////

async function deleteOutreach(id){


    if(!confirm("Delete this outreach activity?"))
        return;



    const {error}=await supabaseClient
    .from("community_outreach")
    .delete()
    .eq("id",id);



    if(error){

        alert(error.message);
        return;

    }



    loadOutreach();



    createAuditLog(
        "DELETE",
        "community_outreach",
        "Deleted outreach activity "+id
    );


}
////////////////////////////////////////////
async function editOutreach(id){


    const {data,error}=await supabaseClient
    .from("community_outreach")
    .select("*")
    .eq("id",id)
    .single();


    if(error){

        alert(error.message);
        return;

    }


    let activity =
    prompt(
        "Activity Name:",
        data.activity_name
    );


    if(activity===null)
        return;


    let date =
    prompt(
        "Activity Date:",
        data.activity_date
    );


    let location =
    prompt(
        "Location:",
        data.location
    );


    let attendance =
    prompt(
        "Attendance:",
        data.attendance
    );


    let notes =
    prompt(
        "Notes:",
        data.notes
    );


    const {error:updateError}=await supabaseClient
    .from("community_outreach")
    .update({

        activity_name:activity,

        activity_date:date,

        location:location,

        attendance:Number(attendance),

        notes:notes

    })
    .eq("id",id);



    if(updateError){

        alert(updateError.message);
        return;

    }


    alert("Outreach activity updated");


    loadOutreach();


    createAuditLog(
        "UPDATE",
        "community_outreach",
        "Updated outreach activity "+activity
    );

}

/////////////////////////////////////////////////////////
function loadReports(){

document.getElementById("reportOutput").innerHTML =
`
<p>
Select a report type above.
</p>
`;

}

////////////////////////////////////////////////////

async function generateFinanceReport(){


const {data,error}=await supabaseClient
.from("transactions")
.select("*");


if(error){

alert(error.message);
return;

}


let income=0;
let expenditure=0;


data.forEach(t=>{


let amount=Number(t.amount || 0);



if(t.type==="Income"){

income += amount;

}
else{

expenditure += amount;

}


});



let balance =
income - expenditure;



document.getElementById("reportOutput").innerHTML=

`

<h3>
Finance Report
</h3>


<p>
Transactions:
${data.length}
</p>


<p>
Income:
£${income.toLocaleString()}
</p>


<p>
Expenditure:
£${expenditure.toLocaleString()}
</p>


<p>
Balance:
£${balance.toLocaleString()}
</p>


`;

}

////////////////////////////////////////////////////

async function generateProjectReport(){


const {data,error}=await supabaseClient
.from("project")
.select("*");


if(error){

alert(error.message);
return;

}



let active=0;
let completed=0;
let cancelled=0;



data.forEach(p=>{


if(p.status_type==2)
active++;


if(p.status_type==3)
completed++;


if(p.status_type==4)
cancelled++;


});



document.getElementById("reportOutput").innerHTML=

`

<h3>
Project Report
</h3>


<p>
Total Projects:
${data.length}
</p>


<p>
Active:
${active}
</p>


<p>
Completed:
${completed}
</p>


<p>
Cancelled:
${cancelled}
</p>


`;

}

////////////////////////////////////////////////////

async function generateOutreachReport(){

const {data,error}=await supabaseClient
.from("community_outreach")
.select("*");


if(error){

alert(error.message);
return;

}


let participants = 0;


data.forEach(a=>{

    participants += Number(a.attendance || 0);

});


document.getElementById("reportOutput").innerHTML =

`

<h3>
Community Outreach Report
</h3>


<p>
Activities:
${data.length}
</p>


<p>
Participants:
${participants}
</p>

`;

}


////////////////////////////////////////////////////

async function generateGrantReport(){


const {data,error}=await supabaseClient
.from("grants")
.select("*");


if(error){

alert(error.message);
return;

}



let total=0;


data.forEach(g=>{


total += Number(g.amount || 0);


});



document.getElementById("reportOutput").innerHTML=

`

<h3>
Grant Funding Report
</h3>


<p>
Total Grants:
${data.length}
</p>


<p>
Funding Received:
£${total.toLocaleString()}
</p>


`;

}
