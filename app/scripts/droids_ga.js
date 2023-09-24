// JavaScript Document

// Start the Genetic Algorithm
function runGA(){
	
	// Get the settings from the UI
	let populationSize = parseInt(document.getElementById('popSize').value);
	let secondsInSimPerDroid = parseInt(document.getElementById('trialSeconds').value);
	let numberOfEvolutions = parseInt(document.getElementById('evoSize').value);
	let distInSimPerDroid = parseInt(document.getElementById('trialDistance').value);
	
	let trialEndTime = document.getElementById('trialEndTime').checked;
	let trialEndDist = document.getElementById('trialEndDist').checked;
	
	// Species setting
	let species_1 = document.getElementById('species_1').checked;
	let species_2 = document.getElementById('species_2').checked;
	let species_3 = document.getElementById('species_3').checked;
	
	// Trial by time or distance
	var trialType = 1;
	if(trialEndDist==true){
		trialType = 2;
	} else {
		trialType = 1;
	}
	console.log('Tial Type: '+trialType);
	
	// Make a genesis population aka population zero
	let droidPopulation = new Population(genome, populationSize);
	
	// Memory store
	memoryStore_droidPopulation = droidPopulation;
	
	// Prepare for new elites
	memoryStore_eliteDroids = [];
	
	// Start the simulation trails
	processGA(droidPopulation, secondsInSimPerDroid, numberOfEvolutions);
	
	// Report to the UI log
	document.getElementById('gaLog').innerHTML = "";
	document.getElementById('gaLog').innerHTML += "- Starting evoltion 0 <br>";
	document.getElementById('imageLog').innerHTML = "<div class='photoBoothTip'>Elite Droids from each population</div>";
}

// Run simulation trails
function processGA(_population, secondsInSimPerDroid, numberOfEvolutions, currentEvolution = 0){

	// Report to the UI log
	function updateLogs(){
		
		// This log panel has changed but lets keep this code for now
		//document.getElementById('simLog').innerHTML = "<div>Latest population:</div><br>";
		
		for(let lifeExperienceInd in _population.droids){
		
			let lifeExperience = _population.droids[lifeExperienceInd];
			let droidNumber = parseInt(lifeExperienceInd)+1;
			let droidButton = '<a href="#" onClick="loadDroidFromPopulation('+lifeExperienceInd+')">Load</div>';
			
			// This log panel has changed but lets keep this code for now
			//document.getElementById('simLog').innerHTML += "<div>Droid: "+ droidNumber +" | Travelled: "+lifeExperience.travelledDistance.toFixed(2).toString()+" | "+ droidButton +"</div>";
		}
	}
	
	// Trial a droid
	function droidRun(_droids, droidNumber){
		
		let lifeExperience = _droids[droidNumber];
		
		if(startedAmmo == true){
			reset();
		}
		
		let genome = new Droid_Genome();
		let encodedGenes = genome.getRandomGenes(30);
		droidRobot = new Droid_Robot(lifeExperience.encodedGenes, genome);

		setTimeout( function(){
			startAmmo();
		},100)
		
		// "Smile" We're taking a photo of this Droid in the sim :)
		setTimeout( function(){
			lifeExperience.photo = takePhoto();
		},1500)
		
		// Wait until trial time has completed
		setTimeout( function(){
			
			pause();
			
			lifeExperience.travelledDistance = distance;
			
			updateLogs();
			
			setTimeout( function(){
				
				droidNumber++;
				
				if(droidNumber<_droids.length){
					
					// Trial the next droid
					droidRun(_droids, droidNumber);
					
				} else {
					
					// Evolution completed
					console.log("Evolution completed: "+currentEvolution)
					evalutateEvolution(_population, secondsInSimPerDroid, numberOfEvolutions, currentEvolution);
				}
				   
			},500);
			
		}, secondsInSimPerDroid*1000)
	}
		
	// Report to the UI log
	updateLogs();
	
	// Trial a droid
	droidRun(_population.droids, 0);
}

// Evalutate the trails
function evalutateEvolution(_population, secondsInSimPerDroid, numberOfEvolutions, currentEvolution){
	
	var bestDistance = 0.0;
	var bestDroidNumber = 0;
	var bestDroidIndex = 0;

	var bestDistanceNext = 0.0;
	var bestDroidNumberNext = 0; 
	var bestDroidIndexNext = 0;
	
	// Report to the UI log
	function bestDroids(){
			
		for(let droidInd in _population.droids){
			
			let lifeExperience = _population.droids[droidInd];
			//console.log(lifeExperience);
			
			let droidNumber = parseInt(droidInd)+1;
			let droidDistance = lifeExperience.travelledDistance;
			
			if(parseFloat(droidDistance*10) > parseFloat(bestDistance*10)){
				
				bestDistance = droidDistance;
				bestDroidNumber = droidNumber;
				bestDroidIndex = droidInd;
				
			} else if(parseFloat(droidDistance*10) > parseFloat(bestDistanceNext*10)){
				
				bestDistanceNext = droidDistance;
				bestDroidNumberNext = droidNumber;
				bestDroidIndexNext = droidInd;
			}
		}
		
		// Get the life experience of the best droid
		let lifeExperience = _population.droids[bestDroidIndex];
		
		// Safely copy 'deeply nested' objects/arrays
		let lifeExperience_droidClone = JSON.parse(JSON.stringify(lifeExperience));
		
		memoryStore_eliteDroids.push(lifeExperience_droidClone);
		
		document.getElementById('gaLog').innerHTML += "&ensp;&ensp; - Best Droid: "+ bestDroidNumber.toString() +" with a distance of: "+ bestDistance.toFixed(2).toString() +" <br>";
		
		// Display the best Droid's photo
		if(lifeExperience.photo != null){ 
			
			let photoContainer = document.createElement("a");
			photoContainer.setAttribute("href", "#");
			photoContainer.setAttribute("class", "photoContainer");
			photoContainer.style.backgroundImage = "url('"+ lifeExperience.photo +"'";
			
			let currentCount = parseInt(memoryStore_eliteDroids.length);
			photoContainer.onclick = function() { loadDroidFromPopulationElites(currentCount-1); };
			
			document.getElementById('imageLog').appendChild(photoContainer);
			document.getElementById('imageLog').appendChild(photoContainer);
		}
		
		/*
		// Debug
		document.getElementById('gaLog').innerHTML += "&ensp;&ensp; - 1st: "+ bestDroidNumber.toString() +" with a distance of: "+ bestDistance.toFixed(2).toString() +" <br>";
		document.getElementById('gaLog').innerHTML += "&ensp;&ensp; - 2nd: "+ bestDroidNumberNext.toString() +" with a distance of: "+ bestDistanceNext.toFixed(2).toString() +" <br>-------------------------------------<br>";
		*/
		
		/* 
		// Debug
		document.getElementById('gaLog').innerHTML += "<br>- Best Droid's genes: <br>";
		document.getElementById('gaLog').innerHTML += bestDroidsDNA.encodedGenes.join();

		document.getElementById('gaLog').innerHTML += "<br><br>- Next best Droid's genes: <br>";
		document.getElementById('gaLog').innerHTML += bestDroidsDNANext.encodedGenes.join();
		*/
	}
	
	// Report to the UI log
	document.getElementById('gaLog').innerHTML += "&ensp; - Evolution "+ currentEvolution +" completed! <br>";
	
	// Report to the UI log
	bestDroids();
	
	// Evalutate for breeding the next batch OR end trials here
	if(currentEvolution < numberOfEvolutions-1){
		
		// build next generation
		console.log("New generation!");
		
		// ToDo - Work out why sometimes the second best result is not being captured in the log 
		// This is a nice to have seen as we don't do anything with the second best and the first best is always correct
		var bestDroidsDNA = _population.droids[bestDroidIndex];
		var bestDroidsDNANext = _population.droids[bestDroidIndexNext];
		
		currentEvolution++;
		
		let legacyPopulation = Object.assign({}, _population);
		
		let nextGenerationPopulation = new Population(genome, _population.populationSize, currentEvolution, legacyPopulation);
		
		// Memory store
		memoryStore_droidPopulation = nextGenerationPopulation;
	   
		setTimeout( function(){
			
			// Report to the UI log
			// Report to the UI log
			document.getElementById('gaLog').innerHTML += "- Starting evolution "+ currentEvolution +" <br>";
			
			// Run the next trails
			processGA(nextGenerationPopulation, secondsInSimPerDroid, numberOfEvolutions, currentEvolution);
			
		},500);
		
	} else {
		
		// End the trials here - we are done!
		
		// Report to the UI log
		console.log("All evolutions completed!");

		setTimeout( function(){
			
			document.getElementById('gaLog').innerHTML += "- All evolutions completed!";
			
			setTimeout( function(){
				alert('Droid evolution completed!');
			}, 2000);

		},500);
	}
}