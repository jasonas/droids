// JavaScript Document

// Droids - Main Script
var scriptsLoaded = false;

// UI
var panelsLeft = false;
var panelsRight = false;

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
	
	let demoDroid_decodedGenes = [
		0.5, 3000, 1500, 1, 
		0.5, 5000, 2000, -1,
		0.5, 2000, 2500, 1,
		0.5, 4000, 3000, -1,
		0.4, 0.3, 0.2,
		0.2, 0.0, 0.28, 
		1, 1, 0.5,
		1, 1, 1, 1,
		0.53
	];
	
	let genome = new Droid_Genome();
	let encodedGenes = genome.encodeGenes(demoDroid_decodedGenes, genome.geneSpec);
	
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

// Toggle UI
function toggleUI(){
	
	let windowPanels = document.getElementsByClassName('windowPanel');
	
	for(let windowPanelInd in windowPanels){
		
		let windowPanel = windowPanels[windowPanelInd];
		
		if(windowPanel.style && windowPanel.style.opacity == 1){
		   windowPanel.style.opacity = 0;
		} else if(windowPanel.style) {
		   windowPanel.style.opacity = 1;
		}
	}
}

// Toggle UI - Left side panels
function toggleSettings(){
	
	if(window.innerWidth < 800){
		if(panelsRight == true){
			toggleLogs();
		}
	}
	
	if(panelsLeft == true){
		
		// Fade out
		document.getElementById('windowPanel_ga').style.opacity = 0;
		document.getElementById('windowPanel_mutate').style.opacity = 0;
		document.getElementById('windowPanel_species').style.opacity = 0;
		
		// Remove
		setTimeout( function(){
			document.getElementById('windowPanel_ga').style.display = 'none';
			document.getElementById('windowPanel_mutate').style.display = 'none';
			document.getElementById('windowPanel_species').style.display = 'none';
			panelsLeft = false;
		},500)
		
	} else {
		
		// Display
		document.getElementById('windowPanel_ga').style.display = 'block';
		document.getElementById('windowPanel_mutate').style.display = 'block';
		document.getElementById('windowPanel_species').style.display = 'block';
		
		// Fade in
		setTimeout( function(){
			document.getElementById('windowPanel_ga').style.opacity = 1;
			document.getElementById('windowPanel_mutate').style.opacity = 1;
			document.getElementById('windowPanel_species').style.opacity = 1;
			panelsLeft = true;
		},500)
	}
}

// Toggle UI - Right side panels
function toggleLogs(){
	
	if(window.innerWidth < 800){
		if(panelsLeft == true){
			toggleSettings();
		}
	}
	 
	if(panelsRight == true){
		
		// Fade out
		document.getElementById('windowPanel_simLog').style.opacity = 0;
		document.getElementById('windowPanel_gaLog').style.opacity = 0;
		document.getElementById('windowPanel_photoBooth').style.opacity = 0;
		
		// Remove
		setTimeout( function(){
			document.getElementById('windowPanel_simLog').style.display = 'none';
			document.getElementById('windowPanel_gaLog').style.display = 'none';
			document.getElementById('windowPanel_photoBooth').display = 'none';
			panelsRight = false;
		},500)
		
	} else {
		
		// Display
		document.getElementById('windowPanel_simLog').style.display = 'block';
		document.getElementById('windowPanel_gaLog').style.display = 'block';
		document.getElementById('windowPanel_photoBooth').style.display = 'block';
		
		// Fade in
		setTimeout( function(){
			document.getElementById('windowPanel_simLog').style.opacity = 1;
			document.getElementById('windowPanel_gaLog').style.opacity = 1;
			document.getElementById('windowPanel_photoBooth').style.opacity = 1;
			panelsRight = true;
		},500)
	}
}

// Listen for the dom's ready state
document.addEventListener('DOMContentLoaded', (event) => {
	
	if(scriptsLoaded!=true){
		
		scriptsLoaded=true; 
		
		console.log('Droids ready!');
		
		// Display the UI
		if(window.innerWidth >= 1000){
			setTimeout( function(){
				// Lets stay hidden by default - for now (may change)
				//toggleSettings();
				//toggleLogs();
			},1000)
		}
		
		genome = new Droid_Genome();
	}
});
