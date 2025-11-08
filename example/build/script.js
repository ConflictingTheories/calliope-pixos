function check_web_storage_support() {
    if(typeof(Storage) !== "undefined") {
        return(true);
    }
    else {
        alert("Web storage unsupported!");
        return(false);
    }
}

function save() {
    if(check_web_storage_support() == true) {
        var area = document.getElementById("area");
        if(area.value != '') {
            localStorage.setItem("note", area.value);
        }
        else {
            alert("Nothing to save");
        }
    }
}

window.addEventListener('load', function load(event){
    var createButton = document.getElementById('save');
    createButton.addEventListener('click', function() { save(); });
});

// -------------------------------------------------------
// Date & Time JS
function updateClock() {
	var date = new Date();
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	var year = date.getFullYear();
	var month = months[date.getMonth()];
	var day_num = date.getDate();
	var day_text = days[date.getDay()];

	if (day_num == 1 || day_num == 21) {
	  var suffix = "st";
	} else if (day_num == 2 || day_num == 22) {
	  var suffix = "nd";
	} else if (day_num == 3 || day_num == 23) {
	  var suffix = "rd";
	} else {
	  var suffix = "th";
	}

	document.getElementById("date").innerHTML = day_text + ", " + month + " " + day_num + suffix + ", " + year;

	var hour_24hrs = date.getHours();
	var hour = (hour_24hrs % 12);
	if (hour == 0) { hour = 12; }
	var amORpm = (hour_24hrs / 12 < 1 ? "AM" : "PM");
	var minute = date.getMinutes();
	if (minute < 10) { minute = "0" + minute; };

	document.getElementById("time").innerHTML = "<b>"+hour + ":" + minute + " " + amORpm+"</b>";

	setTimeout(updateClock, 1000);
}
updateClock();