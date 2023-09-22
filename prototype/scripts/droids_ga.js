// JavaScript Document

// Start the Genetic Algorithm
function runGA(){
	
	// Get the settings from the UI
	let populationSize = parseInt(document.getElementById('popSize').value);
	let secondsInSimPerDroid = parseInt(document.getElementById('trialSeconds').value);
	let numberOfEvolutions = parseInt(document.getElementById('evoSize').value);
	let mutateSizeRate = parseFloat(document.getElementById('mutateSizeRate').value);
	let mutateSizeAmount = parseFloat(document.getElementById('mutateSizeAmount').value);
	let mutateFlexRate = parseFloat(document.getElementById('mutateFlexRate').value);
	let mutateFlexAmount = parseFloat(document.getElementById('mutateFlexAmount').value);
	
	// Make a genesis population aka population zero
	let droidPopulation = new Population(genome, populationSize);
	
	// Memory store
	memoryStore_droidPopulation = droidPopulation;
	
	// Start the simulation trails
	processGA(droidPopulation, secondsInSimPerDroid, numberOfEvolutions);
	
	// Report to the UI log
	document.getElementById('gaLog').innerHTML = "";
	document.getElementById('gaLog').innerHTML += "- Starting evoltion 0 <br>";
}

// Run simulation trails
function processGA(_population, secondsInSimPerDroid, numberOfEvolutions, currentEvolution = 0){

	// Report to the UI log
	function updateLogs(){
		
		document.getElementById('simLog').innerHTML = "";
		document.getElementById('imageLog').innerHTML = "";
		
		for(let droidInd in _population.droids){
		
			let droidDNA = _population.droids[droidInd];
			let droidNumber = parseInt(droidInd)+1;
			let droidButton = '<a href="#" onClick="loadDroidFromPopulation('+droidInd+')">Load</div>';
			
			document.getElementById('simLog').innerHTML += "<div>Droid: "+ droidNumber +" | Travelled: "+droidDNA.travelledDistance.toFixed(2).toString()+" | "+ droidButton +"</div>";
			
			// Photo
			if(droidDNA.photo != null){ 
				let photoContainer = document.createElement("div");
				photoContainer.setAttribute("class", "photoContainer");
				photoContainer.style.backgroundImage = "url('"+ droidDNA.photo +"'";
				document.getElementById('imageLog').appendChild(photoContainer);
			}
		}
	}
	
	// Trial a droid
	function droidRun(_droids, droidNumber){
		
		let droidDNA = _droids[droidNumber];
		
		if(startedAmmo == true){
			reset();
		}
		
		let genome = new Droid_Genome();
		let encodedGenes = genome.getRandomGenes(30);
		droidRobot = new Droid_Robot(droidDNA.encodedGenes, genome);

		setTimeout( function(){
			startAmmo();
		},100)
		
		// ToDo: only take photos of the elite droids from each generation
		// Take a photo
		/*
		setTimeout( function(){
			droidDNA.photo = takePhoto();
		},1500)
		*/
		
		// Wait until trial time has completed
		setTimeout( function(){
			
			pause();
			
			droidDNA.travelledDistance = distance;
			
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
			
			console.log("looking: "+droidInd);
			
			let droidDNA = _population.droids[droidInd];
			//console.log(droidDNA);
			
			let droidNumber = parseInt(droidInd)+1;
			let droidDistance = droidDNA.travelledDistance;
			
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

		document.getElementById('gaLog').innerHTML += "&ensp;&ensp; - 1st: "+ bestDroidNumber.toString() +" with a distance of: "+ bestDistance.toFixed(2).toString() +" <br>";
		document.getElementById('gaLog').innerHTML += "&ensp;&ensp; - 2nd: "+ bestDroidNumberNext.toString() +" with a distance of: "+ bestDistanceNext.toFixed(2).toString() +" <br>-------------------------------------<br>";
		
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
		
		// ToDo - stop the code here and work out why sometimes the second best result is not being captured in the log 
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

		},500);
	}
}