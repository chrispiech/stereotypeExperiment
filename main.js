var MAX_LENGTH = 20
var MIN_WORDS = 2

var csWords = []
var controlWords = []
var expId = null;
var controlOccupation = null;
var csFirst = null;
var antiStereotype = null;
var pagesFinished = 0;
var currentOccupation = null;

$(document).ready(function() {
    //google.maps.event.addDomListener(window, 'load', init);
    init()
});

function init() {
    controlOccupation = getControlOccupation();
    csFirst = Math.random() > 0.5;
    antiStereotype = Math.random() > 0.7;
    expId = getExpId();

    var occupation = csFirst ? 'computer scientist' : controlOccupation
    if(antiStereotype) {
        antiStereotypePage(occupation);
    } else {
        stereotypePage(occupation);
    }
}

function getExpId() {
    var query = getParameterByName('expId');
    return query.replace(/\W/g, '')
}

function getControlOccupation() {
    var query = getParameterByName('condition');
    query = query.replace(/\W/g, '')
    if(query == '') {
        return randomControlOccupation();
    } else {
        return query;
    }
}

function randomControlOccupation() {
    var r = Math.random();
    if(r <= 0.5) {
        return 'biologist'
    } 
    return 'teacher';
}

function randomWordsType() {
    var r = Math.random();
    if(r <= 0.6) {
        return 'stereotype';
    } 
    return 'antiStereotype';

}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function highlightInput() {
    $("#descriptionInput").select();
}

function add() {
	var text = $("#descriptionInput").val();
    if(text == '') {
        warning('First enter a word');
        return
    }
    if(text.length <= 2) {
        warning('Enter full words or phrases.')
        return
    }
    if(text.length > MAX_LENGTH) {
        warning('Enter one description at a time. Max length is ' + MAX_LENGTH +' characters.');
        return  
    }
    if(text.indexOf(',') > -1) {
        warning('Enter one description at a time. No commas');
        return
        
    }
	if(text=="") return;
	var labels = $("#labels");
	var root = $("<button>", {
		"class": "word btn btn-default"
	});

	root.html(text);
	root.data("text", text);
	root.click(function() { 
        root.remove(); 
        highlightInput();
    });

    var close = $('<button>', {
        "class": 'close x', 
        "style": 'float:none;'
    }).html('<span aria-hidden="true">&times;</span>');
    root.append(close);

	$("#nothingMsg").remove();
	labels.append(root);
	$('#descriptionInput').val('');
    removeWarning()
}

function finishedPage() {
    var words = [];
    $('.word').each(function(i, obj) {
        words.push($(obj).data("text"));
    });
    if(words.length < 5) {
        warning("Enter at least five words or phrases");
    } else {
        if(currentOccupation == controlOccupation) {
            controlWords = words;
        } else {
            csWords = words;
        }
        pagesFinished++;
        nextPage();
    }
}

function nextPage() {
    if(pagesFinished == 2) {
        demographicsPage()
    } else {
        var occupation = csFirst ? controlOccupation : 'computer scientist'
        if(antiStereotype) {
            antiStereotypePage(occupation);
        } else {
            stereotypePage(occupation);
        }
    }
}

function removeWarning(msg) {
    $('#alertPlaceholder').html("");
}

function warning(msg) {
    $('#alertPlaceholder').html("");
    alertBar = $('<div>', {
        'class':'alert alert-danger alert-dismissible',
        'role':'alert'
    });
    alertBar.html('<b>Heads up:</b> ' + msg);
    close = $('<button>', {
        'class':'close', 
        'data-dismiss':'alert',
        'type':'button'
    });
    close.html('&times;')

    alertBar.append(close)
    $('#alertPlaceholder').append(alertBar)
}

function stereotypePage(occupation) {
    loadPage('static/templates/stereotype.html', occupation);
}

function antiStereotypePage(occupation) {
    loadPage('static/templates/antiStereotype.html', occupation);
}

function demographicsPage() {
    console.log('hi')
    loadPage('static/templates/demographics.html', '', function() {
        console.log('test')
        var controlNoun = controlOccupation == 'biologist' ? 'Biology' : 'Teaching';
        var controlCapName = controlOccupation == 'biologist' ? 'Biologist' : 'Teacher';
        console.log(controlNoun)
        $('.controlNoun').html(controlNoun);
        $('.controlCapName').html(controlCapName);
        console.log($("#countrySelect"))
        $("#countrySelect").change(function() {
            var country = $("#countrySelect").val()
            if(country == 'USA'){
                 $("#cityZipLabel").html('Zip Code')
                $("#cityZip").attr("placeholder", "e.g. 10001");
                console.log('US')
            } else {
                $("#cityZipLabel").html('City')
                $("#cityZip").attr("placeholder", "e.g. London");
                console.log(country)
            }
        })
    });

}

function loadPage(path, occupation, onFinish) {
    currentOccupation = occupation
    $('#blob').load(path, 
        function() {
            $('#alertPlaceholder').html("");
            $('.occupation').html(occupation);
            $('[data-toggle="tooltip"]').tooltip({
                placement: 'bottom'
            });
            $('[data-toggle="tooltip"]').tooltip()
            $("#descriptionInput").keyup(function(event){
                if(event.keyCode == 13){
                    add();
                }

            });
            highlightInput();
            console.log(onFinish)
            if(onFinish) {
                onFinish();
            }

        }
    );
}

function done() {
    var gender = $( "#genderSelect" ).val();
    var age = $("#inputAge").val()
    var country = $( "#countrySelect option:selected").text();
    var zipCity = $("#cityZip").val()
    var csFamiliarity = $("input:radio[name=familiarity]:checked").val();
    var controlFamiliarity = $("input:radio[name=familiarity2]:checked").val();
    if(gender == 'Please Chose') {
        warning("Please chose a gender");
        return
    }

    if(isNaN(age)) {
        warning("Age must be a number");
        return
    }
    if(age < 5 || age > 105) {
        warning("Age must be in the range 5 to 105")
        return
    }

    if(country == 'United States' && (isNaN(zipCity) || zipCity.length != 5)) {
        warning("Please enter a valid U.S. zip code")
        return
    }

    if(zipCity.length == 0) {
        warning("Please enter a city")
        return
    }

    if(!csFamiliarity || !controlFamiliarity) {
        warning("Please enter your familiarity")
        return
    }

    $('#doneLoading').show();
    $('#doneButton').html('Submitting...')
    $('#doneButton').attr('disabled', 'disabled')

    var orderValue = csFirst ? 'cs-first' : 'control-first';
    var expType = antiStereotype ? 'anti-stereotype' : 'stereotype';

    console.log('all done')
    console.log(expId)
    console.log(country)
    console.log(zipCity)
    console.log(gender)
    console.log(csWords)
    console.log(controlWords)
    console.log(csFamiliarity)
    console.log(controlFamiliarity)
    console.log(expType)
    console.log(orderValue)
    console.log(controlOccupation)
    console.log(age)
    console.log('-----')

    $('#alertPlaceholder').html("");
    $.ajax({
        url: 'http://friendpiechtest.appspot.com/stereotype',
        type: 'GET',
        data: { 
            country:country,
            zipCity:zipCity,
            age:age,
            gender:gender,
            expId:expId,
            csFamiliarity: csFamiliarity,
            controlFamiliarity: controlFamiliarity,
            controlOccupation:controlOccupation,
            order:orderValue,
            expType:expType,
            csWords:JSON.stringify(csWords),
            controlWords:JSON.stringify(controlWords)   
        },
        success: function(data){ 
            $('#doneLoading').hide();
            $('#doneButton').html('Submitted')
            window.location.href='thanks.html';
        },
        error: function(data) {
            console.log(data)
            $('#doneLoading').hide();
            $('#doneButton').removeAttr('disabled')
            $('#doneButton').html('Submit')
            warning('submit failed '); //or whatever
        }
    });
}