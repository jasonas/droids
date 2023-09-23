// JavaScript Document

class Population{ 

	// Main
	constructor(_genome, populationSize, generation=0, legacyPopulation = null){
		
		this.populationSize = populationSize; 
		this.generation = generation;
		this.droids = this.getDroidPopulation(_genome, populationSize, legacyPopulation);
	}
	
	// Returns a population of droids
	getDroidPopulation(_genome, populationSize, legacyPopulation){
		
		let droidPopulation = [];
		
		for(var i=0; i<populationSize; i++){
			
			let encodedGenes;
			
			if( legacyPopulation != null) {
				
				// Get the two most likely fittest parents using the roulette wheel method
				let fitnessScores = this.getFitnessScores(legacyPopulation.droids);
				let fitnessMap = this.getFitnessMap(fitnessScores);
				let parentA_index = this.selectParent(fitnessMap);
				let parentB_index = this.selectParent(fitnessMap);
				
				// A random choice from the two most likely fittest
				/*
				let randChoice = Math.floor(Math.random() * (2 - 1 + 1) + 1);
				
				if(randChoice==1){
				   
					// Got genes from parent a
					encodedGenes = legacyPopulation.droids[parentA_index].encodedGenes;
					
				} else if(randChoice==2){ 
			
					// Got genes from parent b
					encodedGenes = legacyPopulation.droids[parentB_index].encodedGenes;
				}
				*/
				
				// Then get the crossover from the two most likely fittest
				let encodedGenes_crossover = _genome.crossover(legacyPopulation.droids[parentA_index].encodedGenes, legacyPopulation.droids[parentB_index].encodedGenes);
				
				// Then mutate it a bit 
				let encodedGenes_mutation_1 = _genome.pointMutate(encodedGenes_crossover, 5, 1.25);
				
				let mutateSizeRate = parseFloat(document.getElementById('mutateSizeRate').value);
				let mutateSizeAmount = parseFloat(document.getElementById('mutateSizeAmount').value);
				let mutateFlexRate = parseFloat(document.getElementById('mutateFlexRate').value);
				let mutateFlexAmount = parseFloat(document.getElementById('mutateFlexAmount').value);
				
				// Then mutate it a bit more
				let encodedGenes_mutation_2 = _genome.growSizeMutate(encodedGenes_mutation_1, mutateSizeRate, mutateSizeAmount);
				
				// Then mutate it a bit  more
				let encodedGenes_mutation_3 = _genome.shrinkSizeMutate(encodedGenes_mutation_2, mutateSizeRate, mutateSizeAmount);
				
				// Then mutate it a bit more
				let encodedGenes_mutation_4 = _genome.increaseFlexibilityMutate(encodedGenes_mutation_3, mutateFlexRate, mutateFlexAmount);
							
				// Then mutate it a bit more
				let encodedGenes_mutation_5 = _genome.decreaseFlexibilityMutate(encodedGenes_mutation_4, mutateFlexRate, mutateFlexAmount);
				
				// Get the end result
				encodedGenes = encodedGenes_mutation_5;
				
			} else {

				// Get a set of random genes
				encodedGenes = _genome.getRandomGenes(30);
			}
			
			// Will hold information about a Droid's life experience
			let lifeExperience = {
				encodedGenes : encodedGenes,
				travelledDistance : 0,
				fallen : false,
				photo : null
			}
			
			droidPopulation.push(lifeExperience);
		}
		
		// Now add an elite Droid
		if(memoryStore_eliteDroids.length>0){
			
			// Drop the first Droid in this new population
			droidPopulation.shift();
			
			// Then add the latest Droid from the elite Droids
			let latestEliteDroid = memoryStore_eliteDroids[memoryStore_eliteDroids.length - 1];
			
			// Safely copy 'deeply nested' objects/arrays
			let lifeExperience_droidClone = JSON.parse(JSON.stringify(latestEliteDroid));
			
			// Give this Droid a new trial with a clean slate
			lifeExperience_droidClone.travelledDistance = 0;
			lifeExperience_droidClone.fallen = false;
			lifeExperience_droidClone.photo = 0;
			
			droidPopulation.push(lifeExperience_droidClone);
		}
		
		return droidPopulation;
	}
	
	// Get an array of just the scores
	getFitnessScores(_population){

		var fitnessScores = [];

		for(var i=0; i<_population.length; i++){

			let dist = _population[i].travelledDistance;

			fitnessScores.push(dist);
		}

		return fitnessScores;
	}

	// Accumulate fitness scores in sequence
	getFitnessMap(_fitnessScores){

		var fitnessMapping = [];
		var total = 0;

		for(var i=0; i<_fitnessScores.length; i++){

			let fitness = _fitnessScores[i];
			total = total + fitness;

			fitnessMapping.push(total);
		}

		return fitnessMapping;
	}

	// Roulette wheel selection with a weighted distribution
	selectParent(_fitnessMap){

		var r = Math.random(); // 0.0 to 1.0
		r = r * _fitnessMap[_fitnessMap.length -1];

		for(var i=0; i < _fitnessMap.length; i++){

			if(r <= _fitnessMap[i]){
				return i;
			}
		}
	}
	
}
