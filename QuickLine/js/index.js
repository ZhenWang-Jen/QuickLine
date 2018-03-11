/*
 * index.js
 * Put your JavaScript in here
 */

"use strict;"

/*===========================*/
/* put global variables here */
/*===========================*/
var userStoreId;
var userType;
var address;
var lineWaitTime;
var currentStoreName;
var directionsService;
var directionsDisplay;

var map, geocoder, infoWindow, pos, businessID, businessPos, bounds, markersArray, allBusinessAddress=[];
sideNav = document.getElementById('sideNav');
/* wait until all phonegap/cordova is loaded then call onDeviceReady*/
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){	
	init();
}

function init(){
	userStoreId = "";
	userType = "";
	loadBusinessData();
}

/* Scripts for map*/    
function initMap() {
    // Try HTML5 geolocation.
    if (navigator.geolocation) 
    {
    	navigator.geolocation.getCurrentPosition(function(position) 
    	{
    		pos = { lat: position.coords.latitude, lng: position.coords.longitude };
    		// Instantiate an info window to hold current postion text.
    		infoWindow = new google.maps.InfoWindow;
    		infoWindow.setPosition(pos);
    		infoWindow.setContent('You are here');
    		infoWindow.open(map);
    		map.setCenter(pos);
    		// Returns a new LatLngBounds that extends this LatLngBounds to include the given LatLng.
    		bounds = new google.maps.LatLngBounds;
    	}, function() {
    		handleLocationError(true, infoWindow, map.getCenter());
    	});
    } else {
    	// Browser doesn't support Geolocation
    	handleLocationError(false, infoWindow, map.getCenter());
    } 
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;
    // Instantiate a map and center it on current position.
    map = new google.maps.Map(document.getElementById('map'), { center: pos, zoom: 16 });
    directionsDisplay.setMap(map);    
}
/*====================*/
/* put functions here */
/*====================*/
function showSignInPage(form){
	document.getElementById('emailLogin').value = "";
	document.getElementById('passwordLogin').value = "";
	document.getElementById("signInPage").style.display = 'block';
	document.getElementById("signUpPage").style.display = 'none';
	document.getElementById("businessPage").style.display = 'none';
	document.getElementById("mapPage").style.display = 'none';
	initMap();
	return false;
}

function showBusinessSignUpPage(form){
	document.getElementById("signInPage").style.display = 'none';
	document.getElementById("signUpPage").style.display = 'block';
	document.getElementById("signUpFormCustomer").style.display = 'none';
	return false;
}
function showCustomerSignUpPage(form){
	document.getElementById("signInPage").style.display = 'none';
	document.getElementById("signUpPage").style.display = 'block';
	document.getElementById("signUpFormBusiness").style.display = 'none';
	return false;
}

function loadBusinessData() {
	MySql.Execute(
		"sql3.freemysqlhosting.net",	// mySQL server
		"sql3220268", 					// login name
		"CvCv76kEBy", 					// login password
		"sql3220268", 					// database to use
										// SQL query string
		"SELECT 						\
			*							\
		FROM 							\
			business 					\
		;",
			
		function (data) {
			if (!data.Success) 
			{
				alert(data.Error)
			} 
			else 
			{	
				for (var i = 0; i < data.Result.length; i++) 
				{
					newlink = document.createElement('a');
					newlink.innerHTML = data.Result[i].Name;
					businessID = data.Result[i].ID;
					newlink.setAttribute('id', businessID);
					newlink.onclick = function() {
						businessID = document.getElementById(this.id).getAttribute("id"); 
						calculateAndDisplayRoute(businessID, directionsService, directionsDisplay) 
						sideNav.style.width = "0";
						infoWindow.close();
					};
					sideNav.appendChild(newlink);
					allBusinessAddress.push(data.Result[i].Address + "," + data.Result[i].City + "," + data.Result[i].State + " " + data.Result[i].Zip);
				}			
				console.log(allBusinessAddress);
			}
		}
	);
}

function signInButtonOnClick(form){
	var userEmail = document.getElementById('emailLogin');
	var userPassword = document.getElementById('passwordLogin');
	if (userEmail.value != "" && userPassword.value != "")
	  {
		document.getElementById('signInPage').style.display = "none";
		// Check if the visting customer is a business owner.
		if (userEmail.value.includes("@quickline.com") == true) {
			MySql.Execute(
				"sql3.freemysqlhosting.net",	// mySQL server
				"sql3220268", 					// login name
				"CvCv76kEBy", 					// login password
				"sql3220268", 					// database to use
												// SQL query string
				"SELECT 								\
					ID						  			\
				 FROM 									\
					business 							\
				WHERE Email = '" + userEmail.value + 
				"' and Password = '" + userPassword.value + "';",
				
				function (data) {
					if (!data.Success) 
					{
						alert(data.Error)
					} 
					else 
					{	
						loadConsumer();					    
						console.log("The currently visting business is: #" + data.Result[0].ID);				  
					}
				}
			);
		}
		// Check if the visting customer is an existing consumer. 
		else {
			MySql.Execute(
				"sql3.freemysqlhosting.net",	// mySQL server
				"sql3220268", 					// login name
				"CvCv76kEBy", 					// login password
				"sql3220268", 					// database to use
												// SQL query string
				"SELECT 								\
					ID						  			\
				 FROM 									\
					customer 							\
				WHERE Email = '" + userEmail.value + 
				"' and Password = '" + userPassword.value + "';",
				
				function (data) {
					if (!data.Success) 
					{
						alert(data.Error)
					} 
					else 
					{	
						loadConsumer();					    
						console.log("The currently visting customer is: #" + data.Result[0].ID);				  
					}
				}
			);
		}			
	  }
	else {
		alert("It seems to be your first time visting QuickLine. Why not sign up to be a new member?");
	}	
	return false;
}

function loadConsumer() {
	document.getElementById("signInPage").style.display = 'none';
	document.getElementById("signUpPage").style.display = 'none';
	document.getElementById("mapPage").style.display = 'block';
}
function loadBusiness() {
	document.getElementById("signInPage").style.display = 'none';
	document.getElementById("signUpPage").style.display = 'none';
	document.getElementById("mapPage").style.display = 'block';
}



function calculateAndDisplayRoute(businessID, directionsService, directionsDisplay) {
	// Method 1: getting address info from DB//
	/*
	MySql.Execute(
		"sql3.freemysqlhosting.net",	// mySQL server
		"sql3220268", 					// login name
		"CvCv76kEBy", 					// login password
		"sql3220268", 					// database to use
										// SQL query string
		"SELECT 						\
			*							\
		FROM 							\
			business 					\
		WHERE ID = '" + businessID + "';",
			
		function (data) {
			if (!data.Success) 
			{
				alert(data.Error)
			} 
			else 
			{	
				businessPos = data.Result[0].Address + "," + data.Result[0].City + "," + data.Result[0].State + " " + data.Result[0].Zip;	
				directionsService.route({
					origin: pos,
					destination: businessPos,
					travelMode: 'WALKING'
				}, function(response, status) {
					if (status === 'OK') {
						directionsDisplay.setDirections(response);
					} else {
						window.alert('Directions request failed due to ' + status);
					}
				});
			}
		}
	);	
	*/
	// Method 2: getting address by matching data array using index//
	businessPos = allBusinessAddress[businessID-1];
	directionsService.route({
		origin: pos,
		destination: businessPos,
		travelMode: 'WALKING'}, 
		function(response, status) {
			if (status === 'OK') {
				directionsDisplay.setDirections(response);
				console.log("This business' address is: " + businessPos);
			} else {
				window.alert('Directions request failed due to ' + status);
			}
		});
}

/* Scripts for side navigation*/
function openNav() {	
    sideNav.style.width = "40%";   
}

function closeNav() {
    sideNav.style.width = "0";
}	    

function submitButtonOnClickCustomer(form) {
	var FName = document.getElementById('firstNameInputCustomer').value;
	var LName = document.getElementById('lastNameInputCustomer').value;
	var email = document.getElementById('emailInputCustomer').value;		
	var passwordC = document.getElementById('passwordInputCustomer').value;	
	var birthday = document.getElementById('birthdayInput').value;	

	MySql.Execute(
				"sql3.freemysqlhosting.net",	// mySQL server
				"sql3220268", 					// login name
				"CvCv76kEBy", 					// login password
				"sql3220268", 					// database to use
												// SQL query string

				"insert	\ into customer (FName, LName, Email, Password, Birthday) values ('"+FName+"', '"+LName+"', '"+email+"', '"+passwordC+"', '"+birthday+"');",
				
				function (data) {
					if (!data.Success) 
					{
					alert(data.Error)
					} 
					else 
					{				
					console.log("Import user data successfully.");
					showSignInPage();
					}
		    	});
}

function submitButtonOnClickBusiness(form){
	var ownerFName = document.getElementById('firstNameInputBusiness').value;
	var ownerLName = document.getElementById('lastNameInputBusiness').value;
	var email = document.getElementById('emailInputBusiness').value;		
	var passwordB = document.getElementById('passwordInputBusiness').value;	
	var name = document.getElementById('businessNameInput').value;	
	var address = document.getElementById('storeAddressInput').value;	
	var city = document.getElementById('storeCityInput').value;	
	var state = document.getElementById('storeStateInput').value;	
	var zip = document.getElementById('storeZipInput').value;	
	MySql.Execute(
				"sql3.freemysqlhosting.net",	// mySQL server
				"sql3220268", 					// login name
				"CvCv76kEBy", 					// login password
				"sql3220268", 					// database to use
												// SQL query string

				"insert	\ into business (Name, Address, City, State, Zip, OwnerFName, OwnerLName, Email, Password) values ('"+name+"', '"+address+"', '"+city+"', '"+state+"', '"+zip+"', '"+ownerFName+"', '"+ownerLName+"', '"+email+"', '"+passwordB+"');",
				
				function (data) {
					if (!data.Success) 
					{
					alert(data.Error)
					} 
					else 
					{				
					console.log("Import user data successfully.");
					}
		    	});

}

		    