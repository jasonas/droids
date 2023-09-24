// JavaScript Document

class Droid_Genome{ 

	// Main
	constructor(){
		this.geneSpec = this.createPhenotype(null, true);
	}
	
	// Gen a random gene (float between 0 and 1)
	getRandomGenes(_geneLength){
		
		var gene = [];
		
		for(var i=0; i<_geneLength; i++){
			var rand = Math.random();
			
			gene.push(rand);
		}
		
		return gene;
	}
	
	// Create the phenotype from decoded genes
	createPhenotype(genesDecoded=null, needSpecOnly=false){
		
		// We can use this just to return the spec if that's all that's needed
		if(needSpecOnly==true){
			// 30 placeholder genes
			genesDecoded = Array(30).fill(0);
		}
		
		// The phenotype structure with included: value range limits and option limits
		var phenotype = {
			
			// Available servo motors - joints
			"servo_leg_left" : { 
				"angleRange" : { "setType": "variable-range", "min": 0, "max": 1, "set" : genesDecoded[0] }, 
				'startDelay': { "setType": "variable-range", "min": 0, "max": 5000, "set" : genesDecoded[1] }, 
				'frequencyDelay':{ "setType": "variable-range", "min": 0, "max": 5000, "set" : genesDecoded[2] },  
				'startDirection':{ "setType": "variable-option", "options":[-1, 1], "set" : genesDecoded[3] } 
			},

			"servo_leg_right" : { 
				"angleRange" : { "setType": "variable-range", "min": 0, "max": 1, "set" : genesDecoded[4] }, 
				'startDelay': { "setType": "variable-range", "min": 0, "max": 5000, "set" : genesDecoded[5]}, 
				'frequencyDelay':{ "setType": "variable-range", "min": 0, "max": 5000, "set" : genesDecoded[6] },  
				'startDirection':{ "setType": "variable-option", "options":[-1, 1], "set" : genesDecoded[7] }
			},

			"servo_foot_left" : { 
				"angleRange" : { "setType": "variable-range", "min": 0, "max": 1, "set" : genesDecoded[8] }, 
				'startDelay': { "setType": "variable-range", "min": 0, "max": 5000, "set" : genesDecoded[9] }, 
				'frequencyDelay':{ "setType": "variable-range", "min": 0, "max": 5000, "set" : genesDecoded[10] },  
				'startDirection':{ "setType": "variable-option", "options":[-1, 1], "set" : genesDecoded[11] } 
			},

			"servo_foot_right" : { 
				"angleRange" : { "setType": "variable-range", "min": 0, "max": 1, "set" : genesDecoded[12] }, 
				'startDelay': { "setType": "variable-range", "min": 0, "max": 5000, "set" : genesDecoded[13] }, 
				'frequencyDelay':{ "setType": "variable-range", "min": 0, "max": 5000, "set" : genesDecoded[14] },  
				'startDirection':{ "setType": "variable-option", "options":[-1, 1], "set" : genesDecoded[15] } 
			},

			// Available body parts - links
			"body" : { 
				"width" : { "setType": "variable-range", "min": 0.3, "max": 1.0, "set" : genesDecoded[16] },  
				"depth": { "setType": "variable-range", "min": 0.3, "max": 1.0, "set" : genesDecoded[17] },  
				"height": { "setType": "variable-range", "min": 0.2, "max": 1.0, "set" : genesDecoded[18] } 
			},

			"legs" : { 
				//"length": { "setType": "variable-range", "min": 0.1, "max": 0.8, "set" : genesDecoded[19] }, 
				"length": { "setType": "variable-range", "min": 0.1, "max": 0.6, "set" : genesDecoded[19] },
				"width": { "setType": "fixed", "set" : 0.06 }, 
				"depth": { "setType": "fixed", "set" : 0.15 }, 
				"height": { "setType": "fixed", "set" : 11111111 },
				"gap" : { "setType": "fixed", "set" : 11111111 } 
			},

			"feet" : { 
				"width": { "setType": "fixed", "set" : 0.18 }, 
				"depth": { "setType": "fixed", "set" : 11111111 }, 
				"height": { "setType": "variable-range", "min": 0.04, "max": 0.3, "set" : genesDecoded[20] },
				"length": { "setType": "variable-range", "min": 0.1, "max": 0.8, "set" : genesDecoded[21] } 
			},

			"head" : { 
				"type" : { "setType": "variable-option", "options":[1, 2, 3, 4], "set" : genesDecoded[22] }, 
				"mode": { "setType": "variable-option", "options":[1, 2], "set" : genesDecoded[23] }, 
				"length": { "setType": "variable-range", "min": 0.3, "max": 1.0, "set" : genesDecoded[24] }
			},

			"style" : { 
				"head" : { "setType": "variable-option", "options":[1, 2, 3], "set" : genesDecoded[25] },  
				"body" : { "setType": "variable-option", "options":[1, 2, 3], "set" : genesDecoded[26] },
				"legs" : { "setType": "variable-option", "options":[1, 2, 3], "set" : genesDecoded[27] },
				"feet" : { "setType": "variable-option", "options":[1, 2, 3], "set" : genesDecoded[28] }
			},

			"gambit" : { "setType": "variable-range", "min": 0.0, "max": 1.0, "set" : genesDecoded[29] }
		}
		
		// Sort derivative values
		phenotype.legs.height.set = genesDecoded[19];
		phenotype.feet.depth.set = genesDecoded[21];
		
		// Set gap derivative
		function map(value, oldRange, newRange) {
			var newValue = (value - oldRange[0]) * (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]) + newRange[0];
			return Math.min(Math.max(newValue, newRange[0]) , newRange[1]);
		}
		
		// The mulberry32 random function - Good for creating a random like value from a seed
		// Found here: 
		// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
		function mulberry32(a){
			  var t = a += 0x6D2B79F5;
			  t = Math.imul(t ^ t >>> 15, t | 1);
			  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
			  return ((t ^ t >>> 14) >>> 0) / 4294967296;
		}
		
		let joint_legGap_seed = (genesDecoded[16] + genesDecoded[17] + genesDecoded[18]) / (genesDecoded[16] * genesDecoded[21]);
		
		let seededRandom = mulberry32(joint_legGap_seed);
		let joint_legGap = map(seededRandom, [0.0, 1.0], [0.1, genesDecoded[16]/2.5]);
		
		phenotype.legs.gap.set = joint_legGap;
		
		return phenotype;
	}
	
	// Encode genes in floats
	encodeGenes(baseGenes, _geneSpec){
		
		function addZeroes(num, zeros) {
			num = num.toString();
			const dec = num.split('.')[1]
			const len = dec && dec.length > zeros ? dec.length : zeros
			return Number(num).toFixed(len)
		}
		
		function map(value, oldRange, newRange) {
			var newValue = (value - oldRange[0]) * (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]) + newRange[0];
			return Math.min(Math.max(newValue, newRange[0]) , newRange[1]);
		}
		
		function geneEncode(baseValue, randomType, range){

			var new_value = 0;

			if(randomType=="range"){

				new_value = map(baseValue, range, [0.0, 1.0]);
			}

			if(randomType=="option"){

				for(let choiceInd in range){

					let option = range[choiceInd];

					if(baseValue == option){

						new_value = map(choiceInd, [0, range.length-1], [0.0, 1.0]);	
					}

				}

			}
			
			return addZeroes(new_value, 10);
		}
		
		// Encode the genes 
		var encodedGenes = Array(30).fill(0);
		encodedGenes[0] = geneEncode(baseGenes[0], 'range', [_geneSpec.servo_leg_left.angleRange.min, _geneSpec.servo_leg_left.angleRange.max])
		encodedGenes[1] = geneEncode(baseGenes[1], 'range', [_geneSpec.servo_leg_left.startDelay.min, _geneSpec.servo_leg_left.startDelay.max])
		encodedGenes[2] = geneEncode(baseGenes[2], 'range', [_geneSpec.servo_leg_left.frequencyDelay.min, _geneSpec.servo_leg_left.frequencyDelay.max])
		encodedGenes[3] = geneEncode(baseGenes[3], 'option', _geneSpec.servo_leg_left.startDirection.options)
		encodedGenes[4] = geneEncode(baseGenes[4], 'range', [_geneSpec.servo_leg_right.angleRange.min, _geneSpec.servo_leg_right.angleRange.max])
		encodedGenes[5] = geneEncode(baseGenes[5], 'range', [_geneSpec.servo_leg_right.startDelay.min, _geneSpec.servo_leg_right.startDelay.max])
		encodedGenes[6] = geneEncode(baseGenes[6], 'range', [_geneSpec.servo_leg_right.frequencyDelay.min, _geneSpec.servo_leg_right.frequencyDelay.max])
		encodedGenes[7] = geneEncode(baseGenes[7], 'option', _geneSpec.servo_leg_right.startDirection.options)
		encodedGenes[8] = geneEncode(baseGenes[8], 'range', [_geneSpec.servo_foot_left.angleRange.min, _geneSpec.servo_foot_left.angleRange.max])
		encodedGenes[9] = geneEncode(baseGenes[9], 'range', [_geneSpec.servo_foot_left.startDelay.min, _geneSpec.servo_foot_left.startDelay.max])
		encodedGenes[10] = geneEncode(baseGenes[10], 'range', [_geneSpec.servo_foot_left.frequencyDelay.min, _geneSpec.servo_foot_left.frequencyDelay.max])
		encodedGenes[11] = geneEncode(baseGenes[11], 'option', _geneSpec.servo_foot_left.startDirection.options)
		encodedGenes[12] = geneEncode(baseGenes[12], 'range', [_geneSpec.servo_foot_right.angleRange.min,_geneSpec.servo_foot_right.angleRange.max])
		encodedGenes[13] = geneEncode(baseGenes[13], 'range', [_geneSpec.servo_foot_right.startDelay.min,_geneSpec.servo_foot_right.startDelay.max])
		encodedGenes[14] = geneEncode(baseGenes[14], 'range', [_geneSpec.servo_foot_right.frequencyDelay.min, _geneSpec.servo_foot_right.frequencyDelay.max])
		encodedGenes[15] = geneEncode(baseGenes[15], 'option', _geneSpec.servo_foot_right.startDirection.options)
		encodedGenes[16] = geneEncode(baseGenes[16], 'range', [_geneSpec.body.width.min, _geneSpec.body.width.max])
		encodedGenes[17] = geneEncode(baseGenes[17], 'range', [_geneSpec.body.depth.min, _geneSpec.body.depth.max])
		encodedGenes[18] = geneEncode(baseGenes[18], 'range', [_geneSpec.body.height.min, _geneSpec.body.height.max])
		encodedGenes[19] = geneEncode(baseGenes[19], 'range', [_geneSpec.legs.length.min, _geneSpec.legs.length.max])
		
		encodedGenes[20] = geneEncode(baseGenes[20], 'range', [_geneSpec.feet.height.min, _geneSpec.feet.height.max])
		
		encodedGenes[21] = geneEncode(baseGenes[21], 'range', [_geneSpec.feet.length.min, _geneSpec.feet.length.max])
		encodedGenes[22] = geneEncode(baseGenes[22], 'option', _geneSpec.head.type.options)
		encodedGenes[23] = geneEncode(baseGenes[23], 'option', _geneSpec.head.mode.options)
		encodedGenes[24] = geneEncode(baseGenes[24], 'range', [_geneSpec.head.length.min, _geneSpec.head.length.max])
		encodedGenes[25] = geneEncode(baseGenes[25], 'option', _geneSpec.style.head.options)
		encodedGenes[26] = geneEncode(baseGenes[26], 'option', _geneSpec.style.body.options)
		encodedGenes[27] = geneEncode(baseGenes[27], 'option', _geneSpec.style.legs.options)
		encodedGenes[28] = geneEncode(baseGenes[28], 'option', _geneSpec.style.feet.options)
		encodedGenes[29] = geneEncode(baseGenes[29], 'range', [_geneSpec.gambit.min, _geneSpec.gambit.max])
		
		return encodedGenes;
	}
	
	// Decode genes into phenotype readable values
	decodeGenes(encodedGenes, _geneSpec){
		
		function map(value, oldRange, newRange) {
			var newValue = (value - oldRange[0]) * (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]) + newRange[0];
			return Math.min(Math.max(newValue, newRange[0]) , newRange[1]);
		}
		
		function geneDecode(baseValue, randomType, range){

			var new_value = 0;

			if(randomType=="range"){

				new_value = map(baseValue, [0.0, 1.0], range);
				new_value = parseFloat(new_value.toFixed(2));
			}

			if(randomType=="option"){ 
				
				// Debug
				//console.log("Options range: ");
				//console.log(range.length);
				
				let choiceIndex = map(baseValue, [0.0, 1.0], [0, range.length]);
				
				// Clamp index to array size
				if( choiceIndex > range.length-1 ){
					choiceIndex = range.length-1;
				}
				new_value = range[Math.floor(choiceIndex)];
			}

			return new_value;
		}
		
		// Now lets decode the gense 
		var decodedGenes = Array(30).fill(0);
		decodedGenes[0] = geneDecode(encodedGenes[0], 'range', [_geneSpec.servo_leg_left.angleRange.min, _geneSpec.servo_leg_left.angleRange.max])
		decodedGenes[1] = geneDecode(encodedGenes[1], 'range', [_geneSpec.servo_leg_left.startDelay.min, _geneSpec.servo_leg_left.startDelay.max])
		decodedGenes[2] = geneDecode(encodedGenes[2], 'range', [_geneSpec.servo_leg_left.frequencyDelay.min, _geneSpec.servo_leg_left.frequencyDelay.max])
		decodedGenes[3] = geneDecode(encodedGenes[3], 'option', _geneSpec.servo_leg_left.startDirection.options)
		decodedGenes[4] = geneDecode(encodedGenes[4], 'range', [_geneSpec.servo_leg_right.angleRange.min, _geneSpec.servo_leg_right.angleRange.max])
		decodedGenes[5] = geneDecode(encodedGenes[5], 'range', [_geneSpec.servo_leg_right.startDelay.min, _geneSpec.servo_leg_right.startDelay.max])
		decodedGenes[6] = geneDecode(encodedGenes[6], 'range', [_geneSpec.servo_leg_right.frequencyDelay.min, _geneSpec.servo_leg_right.frequencyDelay.max])
		decodedGenes[7] = geneDecode(encodedGenes[7], 'option', _geneSpec.servo_leg_right.startDirection.options)
		decodedGenes[8] = geneDecode(encodedGenes[8], 'range', [_geneSpec.servo_foot_left.angleRange.min, _geneSpec.servo_foot_left.angleRange.max])
		decodedGenes[9] = geneDecode(encodedGenes[9], 'range', [_geneSpec.servo_foot_left.startDelay.min, _geneSpec.servo_foot_left.startDelay.max])
		decodedGenes[10] = geneDecode(encodedGenes[10], 'range', [_geneSpec.servo_foot_left.frequencyDelay.min, _geneSpec.servo_foot_left.frequencyDelay.max])
		decodedGenes[11] = geneDecode(encodedGenes[11], 'option', _geneSpec.servo_foot_left.startDirection.options)
		decodedGenes[12] = geneDecode(encodedGenes[12], 'range', [_geneSpec.servo_foot_right.angleRange.min,_geneSpec.servo_foot_right.angleRange.max])
		decodedGenes[13] = geneDecode(encodedGenes[13], 'range', [_geneSpec.servo_foot_right.startDelay.min,_geneSpec.servo_foot_right.startDelay.max])
		decodedGenes[14] = geneDecode(encodedGenes[14], 'range', [_geneSpec.servo_foot_right.frequencyDelay.min, _geneSpec.servo_foot_right.frequencyDelay.max])
		decodedGenes[15] = geneDecode(encodedGenes[15], 'option', _geneSpec.servo_foot_right.startDirection.options)
		decodedGenes[16] = geneDecode(encodedGenes[16], 'range', [_geneSpec.body.width.min, _geneSpec.body.width.max])
		decodedGenes[17] = geneDecode(encodedGenes[17], 'range', [_geneSpec.body.depth.min, _geneSpec.body.depth.max])
		decodedGenes[18] = geneDecode(encodedGenes[18], 'range', [_geneSpec.body.height.min, _geneSpec.body.height.max])
		decodedGenes[19] = geneDecode(encodedGenes[19], 'range', [_geneSpec.legs.length.min, _geneSpec.legs.length.max])
		decodedGenes[20] = geneDecode(encodedGenes[20], 'range', [_geneSpec.feet.height.min, _geneSpec.feet.height.max])
		decodedGenes[21] = geneDecode(encodedGenes[21], 'range', [_geneSpec.feet.length.min, _geneSpec.feet.length.max])
		decodedGenes[22] = geneDecode(encodedGenes[22], 'option', _geneSpec.head.type.options)
		decodedGenes[23] = geneDecode(encodedGenes[23], 'option', _geneSpec.head.mode.options)
		decodedGenes[24] = geneDecode(encodedGenes[24], 'range', [_geneSpec.head.length.min, _geneSpec.head.length.max])
		decodedGenes[25] = geneDecode(encodedGenes[25], 'option', _geneSpec.style.head.options)
		decodedGenes[26] = geneDecode(encodedGenes[26], 'option', _geneSpec.style.body.options)
		decodedGenes[27] = geneDecode(encodedGenes[27], 'option', _geneSpec.style.legs.options)
		decodedGenes[28] = geneDecode(encodedGenes[28], 'option', _geneSpec.style.feet.options)
		decodedGenes[29] = geneDecode(encodedGenes[29], 'range', [_geneSpec.gambit.min, _geneSpec.gambit.max])
		
		return decodedGenes;
	}
	
	// Get encoded genes from an XML/URDF file
	fromXML(xmlString){
		
		let node = (new DOMParser()).parseFromString(xmlString, "text/xml").documentElement;
		
		// Get the links
		var links = node.querySelectorAll("link");
		
		let linkBody = links[0];
		let body_size = linkBody.childNodes[1].childNodes[1].childNodes[1].getAttribute("size");
		let body_sizes = body_size.split(" ");
		let body_width = parseFloat(body_sizes[0]);
		let body_depth = parseFloat(body_sizes[1]);
		let body_height = parseFloat(body_sizes[2]);
		
		let linkLegLeft = links[1]; // Just need one as the typical legt
		let leg_size = linkLegLeft.childNodes[1].childNodes[1].childNodes[1].getAttribute("size");
		let leg_sizes = leg_size.split(" ");
		let leg_length = parseFloat(leg_sizes[2]); // The typical leg height
		
		let linkFootLeft = links[3]; // Just need one as the typical foot
		let feet_size = linkFootLeft.childNodes[1].childNodes[1].childNodes[1].getAttribute("size");
		let feet_sizes = feet_size.split(" ");
		let feet_length = parseFloat(feet_sizes[1]); // The typical foot depth
		let feet_height = parseFloat(feet_sizes[2]);
		
		// Get the joints
		var joints = node.querySelectorAll("joint");
		function getServoSettings(joint){
			
			var servoSettings = {
				angleRange : 0, 
				motorstartdelay : 0, 
				motorfreqdelay : 0, 
				motorStartDirection : 0
			}
			
			servoSettings.angleRange = Math.abs( parseFloat(joint.childNodes[7].getAttribute("upper")));
			
			let joint_name = joint.getAttribute("name");
			let joint_metaData = joint_name.split("metadata")[1];
			let joint_metaDataArray = joint_metaData.split("_");
			servoSettings.motorstartdelay = parseFloat(joint_metaDataArray[2]);
			servoSettings.motorfreqdelay = parseFloat(joint_metaDataArray[4]);
			
			let joint_velocity = joint.childNodes[7].getAttribute("velocity");
			servoSettings.motorStartDirection = 1; if ( parseFloat(joint_velocity) < 0) { servoSettings.motorStartDirection = -1; }
			
			return servoSettings;
		}
		let joint_leg_left_servoSettings = getServoSettings(joints[0]);
		let joint_leg_right_servoSettings = getServoSettings(joints[1]);
		let joint_foot_left_servoSettings = getServoSettings(joints[2]);
		let joint_foot_right_servoSettings = getServoSettings(joints[3]);
		
		let genesDecoded = [
			joint_leg_left_servoSettings.angleRange, joint_leg_left_servoSettings.motorstartdelay, joint_leg_left_servoSettings.motorfreqdelay, joint_leg_left_servoSettings.motorStartDirection, 
			joint_leg_right_servoSettings.angleRange, joint_leg_right_servoSettings.motorstartdelay, joint_leg_right_servoSettings.motorfreqdelay, joint_leg_right_servoSettings.motorStartDirection, 
			joint_foot_left_servoSettings.angleRange, joint_foot_left_servoSettings.motorstartdelay, joint_foot_left_servoSettings.motorfreqdelay, joint_foot_left_servoSettings.motorStartDirection, 
			joint_foot_right_servoSettings.angleRange, joint_foot_right_servoSettings.motorstartdelay, joint_foot_right_servoSettings.motorfreqdelay, joint_foot_right_servoSettings.motorStartDirection, 
			body_width, body_depth, body_height,
			leg_length, feet_height, feet_length, 
			1, 1, 0.5,
			1, 1, 1, 1,
			0.5
		]
		
		let encodedGenes = this.encodeGenes(genesDecoded, this.geneSpec);
			
		return encodedGenes;
	}
	
	// Get encoded genes from a CSV file
	fromCSV(csvString){
		
		let csvArray = csvString.split(",");
		
		for(let csvArrayInd in csvArray){
			csvArray[csvArrayInd] = parseFloat(csvArray[csvArrayInd])
		}
		
		let encodedGenes = csvArray;
		
		return encodedGenes;
	}
	
	
	///////////////////  Mutation Functions /////////////////////////
	
	// Random cross-over of encoded genes (happens no matter what, it's not by chance but where it crosses is by chance)
	crossover(genesA, genesB){
		
		// Allows for total genes from one side
		//let crossoverPoint = this.randomIntFromInterval(0, genesA.length);
		
		// Ensures atleast 1 gene from each
		let crossoverPoint = this.randomIntFromInterval(1, genesA.length-1);
		
		let sectionFromGenesA = genesA.slice(0, crossoverPoint);
		let sectionFromGenesB = genesB.slice(crossoverPoint, genesB.length);
		
		let combinedGenes = sectionFromGenesA.concat(sectionFromGenesB);
		
        return combinedGenes;
	}
	
	// Point mutation of a set of genes: 
	// Some good value examples:  '3' (1 in 3 genes will be mutated), '1.25' (and then of those, randomly * or / the original gene value)
    pointMutate(genes, rate, amount){
		
		// Safely copy 'deeply nested' objects/arrays
		genes = JSON.parse(JSON.stringify(genes));
		
		var newGenes = [];
		
		for(let geneInd in genes){
			
			var gene = genes[geneInd];
			
			// A chance of 1 in 'rate' of mutating this gene
			let randomChance = this.randomIntFromInterval(1, rate);
			
			if(randomChance==1){
				
				// This was chosen by fate for mutation - mutate it by an amount either more or less
				let amountDirection = this.randomIntFromInterval(0, 1);

				if(amountDirection == 0){
					gene = gene / amount;
				} else {
					gene = gene * amount;
				}
				
				// Clamp the new gene between 0 and 1
				if(gene>1){ 
					gene = 1.0;
				}
				else if(gene<0){ 
					gene = 0.1;
				}
				
				 newGenes.push(gene);
				
			} else {
				 newGenes.push(gene);
			}
		}
		
        return newGenes;
	}
	
	// This could be used to remove an appendage however since we are limited to bipedal droids, 
	// we'll just lower gene values related to the droids size
    shrinkSizeMutate(genes, rate, amount){
		
		// Safely copy 'deeply nested' objects/arrays
		genes = JSON.parse(JSON.stringify(genes));
		
		function maybeMutateGene(_this, gene){
			
			// A chance of 1 in 'rate' of mutating this gene
			let randomChance = _this.randomIntFromInterval(1, rate);

			if(randomChance==1){
				
				// Decrease this gene
				gene = gene / amount;
				
				// Clamp the new gene between 0 and 1
				if(gene>1){ 
					gene = 1.0;
				}
				else if(gene<0){ 
					gene = 0.1;
				}
				
				return gene;

			} else {
				return gene;
			}
		}
		
		// Only works on genes where these values are related to size
		if(genes.length>21){		
			genes[16] = maybeMutateGene(this, genes[16]); // body width
			genes[17] = maybeMutateGene(this, genes[17]); // body depth
			genes[18] = maybeMutateGene(this, genes[18]); // body height
			genes[19] = maybeMutateGene(this, genes[19]); // leg length
			genes[21] = maybeMutateGene(this, genes[21]); // feet length
		}
		
        return genes;
	}
	
	// This could be used to add an appendage however since we are limited to bipedal droids, 
	// we'll just increase gene values related to the droids size
    growSizeMutate(genes, rate, amount){
		
		// Safely copy 'deeply nested' objects/arrays
		genes = JSON.parse(JSON.stringify(genes));
		
		function maybeMutateGene(_this, gene){
			
			// A chance of 1 in 'rate' of mutating this gene
			let randomChance = _this.randomIntFromInterval(1, rate);

			if(randomChance==1){
				
				// Increase this gene
				gene = gene * amount;
				
				// Clamp the new gene between 0 and 1
				if(gene>1){ 
					gene = 1.0;
				}
				else if(gene<0){ 
					gene = 0.1;
				}
				
				return gene;

			} else {
				return gene;
			}
		}
		
		// Only works on genes where these values are related to size
		if(genes.length>21){		
			genes[16] = maybeMutateGene(this, genes[16]); // body width
			genes[17] = maybeMutateGene(this, genes[17]); // body depth
			genes[18] = maybeMutateGene(this, genes[18]); // body height
			genes[19] = maybeMutateGene(this, genes[19]); // leg length
			genes[21] = maybeMutateGene(this, genes[21]); // feet length
		}
		
        return genes;
	}

	// Decreases the servo range for hinge joints
    decreaseFlexibilityMutate(genes, rate, amount){
		
		// Safely copy 'deeply nested' objects/arrays
		genes = JSON.parse(JSON.stringify(genes));
		
		function maybeMutateGene(_this, gene){
			
			// A chance of 1 in 'rate' of mutating this gene
			let randomChance = _this.randomIntFromInterval(1, rate);

			if(randomChance==1){
				
				// Decrease this gene
				gene = gene / amount;
				
				// Clamp the new gene between 0 and 1
				if(gene>1){ 
					gene = 1.0;
				}
				else if(gene<0){ 
					gene = 0.1;
				}
				
				return gene;

			} else {
				return gene;
			}
		}
		
		// Only works on genes where these values are related to the servo angle ranges
		if(genes.length>12){		
			genes[0] = maybeMutateGene(this, genes[0]); // Servo 1 angle range
			genes[4] = maybeMutateGene(this, genes[4]); // Servo 2 angle range
			genes[8] = maybeMutateGene(this, genes[8]); // Servo 3 angle range
			genes[12] = maybeMutateGene(this, genes[12]); // Servo 4 angle range
		}
		
        return genes;
	}
	
	// Increases the servo range for hinge joints
    increaseFlexibilityMutate(genes, rate, amount){
		
		// Safely copy 'deeply nested' objects/arrays
		genes = JSON.parse(JSON.stringify(genes));
		
		function maybeMutateGene(_this, gene){
			
			// A chance of 1 in 'rate' of mutating this gene
			let randomChance = _this.randomIntFromInterval(1, rate);

			if(randomChance==1){
				
				// Increase this gene
				gene = gene * amount;
				
				// Clamp the new gene between 0 and 1
				if(gene>1){ 
					gene = 1.0;
				}
				else if(gene<0){ 
					gene = 0.1;
				}
				
				return gene;

			} else {
				return gene;
			}
		}
		
		// Only works on genes where these values are related to the servo angle ranges
		if(genes.length>12){		
			genes[0] = maybeMutateGene(this, genes[0]); // Servo 1 angle range
			genes[4] = maybeMutateGene(this, genes[4]); // Servo 2 angle range
			genes[8] = maybeMutateGene(this, genes[8]); // Servo 3 angle range
			genes[12] = maybeMutateGene(this, genes[12]); // Servo 4 angle range
		}
		
        return genes;
	}
	
	
	///////////////////  Helper Functions /////////////////////////
	
	// Generates a random integer between a min and max - with min and max included 
	randomIntFromInterval(min, max) { 
		return Math.floor(Math.random() * (max - min + 1) + min)
	}
	
}

// URDF link conversion
class URDFLinkElement{
	
	// Main
	constructor(
		name, 
		link_width,
		link_depth,
		link_height,
		material
	){
		this.name = name;
		this.link_width = link_width;
		this.link_depth = link_depth;
		this.link_height = link_height;
		this.material = material;
	}
	
	getLinkElement(){
		
		let adom = document;
  
        let link_tag = adom.createElement("link");
        link_tag.setAttribute("name", this.name);
		
        let vis_tag = adom.createElement("visual");
        let geom_tag = adom.createElement("geometry");
        let box_tag = adom.createElement("box");
		
		let color_tag = adom.createElement("color");
		let material_tag = adom.createElement("material");
		
		if(this.material==0){
			material_tag.setAttribute("name","black");
			color_tag.setAttribute("rgba", "0.0 0.0 0.0 1.0");
		} else if(this.material==1){
			material_tag.setAttribute("name","white");
			color_tag.setAttribute("rgba", "1.0 1.0 1.0 1.0");
		} else if(this.material==2){
			material_tag.setAttribute("name","red");
			color_tag.setAttribute("rgba", "1.0 0.0 0.0 1.0");
		} 
		material_tag.appendChild(color_tag);
		
		
		let link_size = "" + this.link_width + " " + this.link_depth + " " + this.link_height + "";
        box_tag.setAttribute("size", link_size);
        
        geom_tag.appendChild(box_tag);
        vis_tag.appendChild(geom_tag);
		vis_tag.appendChild(material_tag);
        
        let coll_tag = adom.createElement("collision");
        let c_geom_tag = adom.createElement("geometry");
        let c_box_tag = adom.createElement("box");
		
        c_box_tag.setAttribute("size", link_size);
        
        c_geom_tag.appendChild(c_box_tag);
        coll_tag.appendChild(c_geom_tag);
        
        let inertial_tag = adom.createElement("inertial");
        let mass_tag = adom.createElement("mass");
		
        let mass = 1 * ((this.link_width * this.link_depth) * this.link_height);
		
        mass_tag.setAttribute("value", mass.toString());
		
        let inertia_tag = adom.createElement("inertia");
       
        inertia_tag.setAttribute("ixx", "0.03");
        inertia_tag.setAttribute("iyy", "0.03");
        inertia_tag.setAttribute("izz", "0.03");
        inertia_tag.setAttribute("ixy", "0");
        inertia_tag.setAttribute("ixz", "0");
        inertia_tag.setAttribute("iyx", "0");
        inertial_tag.appendChild(mass_tag);
        inertial_tag.appendChild(inertia_tag);
        
        link_tag.appendChild(vis_tag);
        link_tag.appendChild(coll_tag);
        link_tag.appendChild(inertial_tag);
        
        return link_tag;
	}
}

// URDF joint conversion
class URDFJointElement{
	
	// Main
	constructor(
		name, 
		parent_name,
		child_name,
		axis_xyz,
		limit_lower,
		limit_upper,
		limit_velocity,
		origin_xyz 
	){
		this.name = name;
		this.parent_name = parent_name;
		this.child_name = child_name;
		this.axis_xyz = axis_xyz;
		this.limit_lower = limit_lower,
		this.limit_upper = limit_upper,
		this.limit_velocity = limit_velocity,
		this.origin_xyz = origin_xyz;
	}
	
	getJointElement(){
		
		let adom = document;
 
		let joint_tag = adom.createElement("joint");
        joint_tag.setAttribute("name", this.name);
		joint_tag.setAttribute("type", "revolute");
	
		let parent_tag = adom.createElement("parent");
		parent_tag.setAttribute("link", this.parent_name); 
		
		let child_tag = adom.createElement("child");
		child_tag.setAttribute("link", this.child_name);
		
		let axis_tag = adom.createElement("axis");
		axis_tag.setAttribute("xyz", this.axis_xyz);
		
		let limit_tag = adom.createElement("limit");
		
		limit_tag.setAttribute("effort", "10");
		
		limit_tag.setAttribute("lower", this.limit_lower);
		
		limit_tag.setAttribute("upper", this.limit_upper);
		
		limit_tag.setAttribute("velocity", this.limit_velocity);
		
		let origin_tag = adom.createElement("origin");
		origin_tag.setAttribute("rpy", "0.0 0.0 0.0");
		origin_tag.setAttribute("xyz", this.origin_xyz);
		
		joint_tag.appendChild(parent_tag);
        joint_tag.appendChild(child_tag);
        joint_tag.appendChild(axis_tag);
        joint_tag.appendChild(limit_tag);
        joint_tag.appendChild(origin_tag);
        
        return joint_tag;
	}
}
