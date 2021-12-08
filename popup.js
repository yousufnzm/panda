function onAnchorClick(event) {
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href
  });
  return false;
}
// Given an array of URLs, build a DOM list of those URLs in the
// browser action popup.
function buildPopupDom(divName, data) {
  var popupDiv = document.getElementById(divName);
  var ul = document.createElement('ul');
  popupDiv.appendChild(ul);
  for (var i = 0, ie = data.length; i < ie; ++i) {
    var a = document.createElement('a');
    a.href = data[i];
    a.appendChild(document.createTextNode(data[i]));
    a.addEventListener('click', onAnchorClick);
    var li = document.createElement('li');
    li.appendChild(a); 
    ul.appendChild(li);
  }
}

var keywords=[
    {
      "category":"bullying",
      "intensity":[{

        "priority":"0",
      "words":["torment","dominate","intimidate","terrorise","aggresive","harass","oppress","hit"]
    },
    {
      "priority":"1",
      "words":["thrash","bludgeon","assault","pulverise","attack","victimise",]
    }
    ]},

    {
      "category":"sexual abuse",
      "intensity":[{
        "priority":"0",
        "words":["grope","catcall","sexual pressure","sexual advances","exploit"]
      },
      {
        "priority":"1",
        "words":["rape","sexual assault","molest","violate","forcible intercourse","forced sex"]
      }]
    },
    {
      "category":"drugs",
      "intensity":[{
        "priority":"1",
        "words":["cocaine","heroin","weed","marijuana","lsd","hard drugs","narcotics","hashish","cannabis","hemp","ganja","owsleys acid","opium"]
      }]
    },

    {
      "category":"gen depression",
      "intensity":[{
        "priority":"1",
        "words":["suicide","agony","alone","breakdown","catatonic","desolate","despair","forlorn","helpless","suicidal","vulnerable","shattered"]
      }]
    }];
// Search history to find up to ten links that a user has typed in,
// and show those links in a popup.
function buildTypedUrlList(divName) {
  // To look for history items visited in the last week,
  // subtract a week of microseconds from the current time.
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 30;
  var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  var numRequestsOutstanding = 0;
  chrome.history.search({
      'text': 'http://google.co.in/search',              // Return every history item....
      'startTime': oneWeekAgo  // that was accessed less than one week ago.
    },
    function(historyItems) {
      // For each history item, get details on all visits.
      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;
        var processVisitsWithUrl = function(url) {
          // We need the url of the visited item to process the visit.
          // Use a closure to bind the  url into the callback's args.
          return function(visitItems) {
            processVisits(url, visitItems);
          };
        };
        chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
        numRequestsOutstanding++;
      }
      if (!numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    });
  // Maps URLs to a count of the number of times the user typed that URL into
  // the omnibox.
  var urlToCount = {};
  // Callback for chrome.history.getVisits().  Counts the number of
  // times a user visited a URL by typing the address.
  var processVisits = function(url, visitItems) {
    for (var i = 0, ie = visitItems.length; i < ie; ++i) {
      if (!urlToCount[url]) {
        urlToCount[url] = 0;
      }
      urlToCount[url]++;
    }
    // If this is the final outstanding call to processVisits(),
    // then we have the final results.  Use them to build the list
    // of URLs to show in the popup.
    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };
  // This function is called when we have the final list of URls to display.
  var onAllVisitsProcessed = function() {
    // Get the top scorring urls.
    urlArray = [];
    var patt = /q=/
    var pat = /&/;
	var thb=0,thdr=0,ths=0,thde=0;

    for (var url in urlToCount) {
    	var str = url.toString();
    	var n = str.search(patt);
    	str = str.slice(n + 2, str.length - 1);
    	n = str.search(pat);
    	str = str.slice(0, n);
    	str = str.replace(/\+/gi ,' ');

    //	str="cars driving slowly";
    	var nouns = nlp(str).match('#Noun').out('array');
		var verbs = nlp(str).match('#Verb').out('array');
		var adjectives = nlp(str).match('#Adjective').out('array');

	//	var nouns=["suicide","agony","alone","narcotics","violate","catcall",];
	//	var verbs=["exploiting","molesting","raping","groping",];
	//	var adjectives=["vulnerable"];
		var dep=nouns.concat(verbs,adjectives);
		//console.log(dep);
		//console.log(nouns);
    	//console.log(verbs);
    	//console.log(adjectives);

    	//nouns=["husband","bludgeon","mistress"];
    	for(var l=0;l<dep.length;l++)
	    {
	      console.log("searching word " + dep[l]);
	      for(var i=0;i<keywords.length;i++)
	      {
	      	for(var j=0;j<keywords[i].intensity.length;j++)
	      	{
	      		for(var k=0;k<keywords[i].intensity[j].words.length;k++)
	      		{
	      			if(dep[l].indexOf(keywords[i].intensity[j].words[k]) !== -1)
			        {
			          if(keywords[i].category === "bullying" )
			          {
			          	if(keywords[i].priority === "1")
			          		thb+=2;
			          	else
			          		thb++;
			          }
				      if(keywords[i].category === "drugs" )
				      {
				      	if(keywords[i].priority === "1")
				      		thdr+=2;
				      	else
				      		thdr++;
				      }
				      if(keywords[i].category === "sexual abuse")
				       {
				      	if(keywords[i].priority === "1")
				      		ths+=2;
				      	else
				      		ths++;
				       }
				      if(keywords[i].category === "gen depression" )
				       {
				      	if(keywords[i].priority === "1")
				      		thde+=2;
				      	else
				      		thde++;
				       }
			          console.log(keywords[i].category + " category coz -> " + keywords[i].intensity[j].words[k]);
			        }
	      		}
	      	}
	      }
	    }
	    console.log(thb);

    	urlArray.push(str);
    }

    var per=(thb/urlArray.length)*100;
    console.log(per);
	    if(per>10)
	    {

	    }
	    per=(thdr/urlArray.length)*100;
	    console.log(per);
	    if(per>10)
	    {

	    }
	    per=(ths/urlArray.length)*100;
	    console.log(per);
	    if(per>10)
	    {

	    }
	    per=(thde/urlArray.length)*100;
	    console.log(per);
	    if(per>10)
	    {
	    	
	    }


    // Sort the URLs by the number of times the user typed them.
    urlArray.sort(function(a, b) {
      return urlToCount[b] - urlToCount[a];
    });

    buildPopupDom(divName, urlArray);
  };
}



document.addEventListener('DOMContentLoaded', function () {
  buildTypedUrlList("typedUrl_div");
});