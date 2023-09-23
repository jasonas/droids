// JavaScript Document

// Droids - Main Script
var scriptsLoaded = false;

//let genome;

// Required as a global for the renderer
var droidRobot;

// Provides the option to quickly look back at interesting Droids
var memoryStore_droidPopulation = []; 
var memoryStore_eliteDroids = []; 

///////////////////  Quick View Functions /////////////////////////

// Make and load a droid from a set of example base genes
function makeDroidBase(){
	
	if(startedAmmo == true){
		reset();
	}
	
	let baseDroid_decodedGenes = [
		0.5, 3000, 1500, 1, 
		0.5, 5000, 2000, -1,
		0.5, 2000, 2500, 1,
		0.5, 4000, 3000, -1,
		0.4, 0.3, 0.2,
		0.2, 0.0, 0.28, 
		1, 1, 0.5,
		1, 1, 1, 1,
		0.0
	];
	
	let genome = new Droid_Genome();
	let encodedGenes = genome.encodeGenes(baseDroid_decodedGenes, genome.geneSpec);
	
	droidRobot = new Droid_Robot(encodedGenes, genome);
	
	setTimeout( function(){
		startAmmo();
	},100)
}	

// Make and load a droid from a completely random set of genes
function makeDroidRandom(){
	
	if(startedAmmo == true){
		reset();
	}
	
	let genome = new Droid_Genome();
	let encodedGenes = genome.getRandomGenes(30);
	
	droidRobot = new Droid_Robot(encodedGenes, genome);
	
	console.log("Checking parts..");
	console.log('Head style options: ' + droidRobot.phenotype.style.head.options.join());
	console.log('Head style: ' + droidRobot.phenotype.style.head.set);
	console.log('Body style: ' + droidRobot.phenotype.style.body.set);
	console.log('Legs style: ' + droidRobot.phenotype.style.legs.set);
	console.log('Feet style: ' + droidRobot.phenotype.style.feet.set);
	
	setTimeout( function(){
		startAmmo();
	},100)
}

// Make and load a droid from genes stored in a population pool
function loadDroidFromPopulation(droidPolulationId){
	
	let lifeExperience = memoryStore_droidPopulation.droids[droidPolulationId];
	
	let genome = new Droid_Genome();
	droidRobot = new Droid_Robot(lifeExperience.encodedGenes, genome);
		
	if(startedAmmo == true){
		reset();
	}
	
	startAmmo();
}


// Make and load a droid from genes stored in a population elites pool
function loadDroidFromPopulationElites(droidPolulationId){
	
	let index = parseInt(droidPolulationId);
	
	console.log("Reloadling elite index: "+ index);
	
	let lifeExperience = memoryStore_eliteDroids[index];
	
	let genome = new Droid_Genome();
	droidRobot = new Droid_Robot(lifeExperience.encodedGenes, genome);
		
	if(startedAmmo == true){
		reset();
	}
	
	startAmmo();
}


// Simulation without evolutions
function runSimulation(){
	
	// Quick view settings
	let populationSize = 3;
	let secondsInSimPerDroid = 5;
	
	let droidPopulation = new Population(genome, populationSize);
	
	// Memory store
	memoryStore_droidPopulation = droidPopulation;
	
	processSimulation(droidPopulation, secondsInSimPerDroid);
	
	// Clear the image log 
	document.getElementById('imageLog').innerHTML = "<div>Photos of current population:</div><br>";
}

function processSimulation(_population, secondsInSimPerDroid){

	function updateSimLog(){
		
		// Clear the sim log
		document.getElementById('simLog').innerHTML = "";
		
		// Clear the image log
		document.getElementById('imageLog').innerHTML = "<div>Photos of current population:</div><br>";
		
		for(let droidInd in _population.droids){
		
			let lifeExperience = _population.droids[droidInd];

			let droidNumber = parseInt(droidInd)+1;
			
			let droidButton = '<a href="#" onClick="loadDroidFromPopulation('+droidInd+')">Load</div>';
			
			document.getElementById('simLog').innerHTML += "<div>Droid: "+ droidNumber +" | Travelled: "+lifeExperience.travelledDistance.toFixed(2).toString()+" | "+ droidButton +"</div>";
			
			// Display the Droid's photo
			if(lifeExperience.photo != null){ 
				let photoContainer = document.createElement("div");
				photoContainer.setAttribute("class", "photoContainer");
				photoContainer.style.backgroundImage = "url('"+ lifeExperience.photo +"'";
				document.getElementById('imageLog').appendChild(photoContainer);
			}
		}
	}
	
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
		
		
		// Take a photo
		setTimeout( function(){
			droidDNA.photo = takePhoto();
		},1500)
		
		setTimeout( function(){
			
			pause();
			
			droidDNA.travelledDistance = distance;
			
			updateSimLog();
			
			setTimeout( function(){
				
				droidNumber++;
				
				if(droidNumber<_droids.length){
					
					droidRun(_droids, droidNumber);
					
				} else {
					
					// Sim completed
					alert('Simulation run completed!');
				}
				   
			},500);
			
		}, secondsInSimPerDroid*1000)
		
	}
				   
	updateSimLog();
	
	droidRun(_population.droids, 0);
}


///////////////////  I/O Functions /////////////////////////

// XML/URDF export
function exportDroid(){
	
	if( !droidRobot){
	   alert("No Droid created yet");
	} else {
		droidRobot.toXml(true);
	}
}

// XML/URDF imports
function xmlParser(e, file){
	
	var reader = new FileReader();

	reader.onload = function (e) {
		let xmlString = reader.result;
		
		console.log("XML from file: ");
		console.log(xmlString);
		
		if(startedAmmo == true){
			reset();
		}
		
		let genome = new Droid_Genome();
		let encodedGenes = genome.fromXML(xmlString);
		
		droidRobot = new Droid_Robot(encodedGenes, genome);
	
		setTimeout( function(){
			startAmmo();
		},100)	
	}

	reader.readAsText(file);
}

function importDroid(){
	document.getElementById('importFile').click();
}

function importedXML(e){
	
	let el = document.getElementById('importFile');
	if (el.files.length) {
      let file = el.files[0];
		//console.log(file);
		xmlParser(e, file);
    } else {
		console.log('No file');
	}
}


// CSV export
function exportGenome(){
	
	if( !droidRobot){
	   alert("No Droid created yet");
	} else {
		droidRobot.toCSV();
	}
}

// CSV imports
function csvParser(e, file){
	
	var reader = new FileReader();

	reader.onload = function (e) {
		let csvString = reader.result;
		
		console.log("CSV from file: ");
		console.log(csvString);
		
		if(startedAmmo == true){
			reset();
		}
		
		let genome = new Droid_Genome();
		let encodedGenes = genome.fromCSV(csvString);
		
		droidRobot = new Droid_Robot(encodedGenes, genome);
	
		setTimeout( function(){
			startAmmo();
		},100)
			
	}

	reader.readAsText(file);
}

function importGenome(){
	document.getElementById('importGenome').click();
}

function importedCSV(e){
	
	let el = document.getElementById('importGenome');
	if (el.files.length) {
      let file = el.files[0];
		//console.log(file);
		csvParser(e, file);
    } else {
		console.log('No file');
	}	
}


// Listen for the dom's ready state
document.addEventListener('DOMContentLoaded', (event) => {
	
	if(scriptsLoaded!=true){
		
		scriptsLoaded=true; 
		
		console.log('Droids ready!');
		
		genome = new Droid_Genome();
	}
});

