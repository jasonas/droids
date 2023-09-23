// JavaScript Document

class Droid_Robot{ 

	// Main
	constructor(_encodedGenes, _genome){
		
		this.encodedGenes = _encodedGenes;
		this.genesDecoded = _genome.decodeGenes(_encodedGenes, _genome.geneSpec);
		this.phenotype = _genome.createPhenotype(this.genesDecoded);
		this.genome = _genome;
	}
	
	// Create an XML / URDF file containing a Droid's decoded phenome structure
	toXml(donwload=false){
		
		let robotTag = document.createElement("robot");
		robotTag.name = 'robot';
		robotTag.setAttribute("name","robot");
		
		let link_body = new URDFLinkElement("link_body", this.phenotype.body.width.set, this.phenotype.body.depth.set, this.phenotype.body.height.set, 0)
		robotTag.appendChild(link_body.getLinkElement())
		
		let link_leg_left = new URDFLinkElement("link_leg_left", this.phenotype.legs.width.set, this.phenotype.legs.depth.set, this.phenotype.legs.height.set, 1)
		robotTag.appendChild(link_leg_left.getLinkElement())
		
		let link_leg_right = new URDFLinkElement("link_leg_right", this.phenotype.legs.width.set, this.phenotype.legs.depth.set, this.phenotype.legs.height.set, 1)
		robotTag.appendChild(link_leg_right.getLinkElement())
		
		let link_foot_left = new URDFLinkElement("link_foot_left", this.phenotype.feet.width.set, this.phenotype.feet.depth.set, this.phenotype.feet.height.set, 0)
		robotTag.appendChild(link_foot_left.getLinkElement())
		
		let link_foot_right = new URDFLinkElement("link_foot_right", this.phenotype.feet.width.set, this.phenotype.feet.depth.set, this.phenotype.feet.height.set, 2)
		robotTag.appendChild(link_foot_right.getLinkElement())
		
		let gapDistance = this.phenotype.legs.gap.set;
		let gapLeft = Math.abs(this.phenotype.legs.gap.set)*-1; // Negative this value as it's on the left side
		let gapRight = gapDistance;
		
		let joint_leg_left = new URDFJointElement(
			"joint_leg_left_metadata_motorstartdelay_" + this.phenotype.servo_leg_left.startDelay.set + "_motorfreqdelay_" + this.phenotype.servo_leg_left.frequencyDelay.set,
			"link_body",
			"link_leg_left",
			"0 0 1",
			Math.abs(this.phenotype.servo_leg_left.angleRange.set)*-1,
			this.phenotype.servo_leg_left.angleRange.set,
			1.1*this.phenotype.servo_leg_left.startDirection.set,
			"" + gapLeft + " 0 " + -((this.phenotype.body.height.set + this.phenotype.legs.height.set) / 2)
		)
		robotTag.appendChild(joint_leg_left.getJointElement())
		
		let joint_leg_right = new URDFJointElement(
			"joint_leg_right_metadata_motorstartdelay_" + this.phenotype.servo_leg_right.startDelay.set + "_motorfreqdelay_" + this.phenotype.servo_leg_right.frequencyDelay.set,
			"link_body",
			"link_leg_right",
			"0 0 1",
			Math.abs(this.phenotype.servo_leg_right.angleRange.set)*-1,
			this.phenotype.servo_leg_right.angleRange.set,
			1.1*this.phenotype.servo_leg_right.startDirection.set,
			"" + gapRight + " 0.0 " + -((this.phenotype.body.height.set + this.phenotype.legs.height.set) / 2)
		)
		robotTag.appendChild(joint_leg_right.getJointElement())
		
		let joint_foot_left = new URDFJointElement(
			"joint_foot_left_metadata_motorstartdelay_" + this.phenotype.servo_foot_left.startDelay.set + "_motorfreqdelay_" + this.phenotype.servo_foot_left.frequencyDelay.set,
			"link_leg_left",
			"link_foot_left",
			"0 1 0",
			Math.abs(this.phenotype.servo_foot_left.angleRange.set)*-1,
			this.phenotype.servo_foot_left.angleRange.set,
			1.1*this.phenotype.servo_foot_left.startDirection.set,
			"" + -0.02 + " 0.0 " + -((this.phenotype.legs.height.set + this.phenotype.feet.height.set) / 2)
		)
		robotTag.appendChild(joint_foot_left.getJointElement())
		
		let joint_foot_right = new URDFJointElement(
			"joint_foot_right_metadata_motorstartdelay_" + this.phenotype.servo_foot_right.startDelay.set + "_motorfreqdelay_" + this.phenotype.servo_foot_right.frequencyDelay.set,
			"link_leg_right",
			"link_foot_right",
			"0 1 0",
			Math.abs(this.phenotype.servo_foot_right.angleRange.set)*-1,
			this.phenotype.servo_foot_right.angleRange.set,
			1.1*this.phenotype.servo_foot_right.startDirection.set,
			"" + 0.02 + " 0.0 " + -((this.phenotype.legs.height.set + this.phenotype.feet.height.set) / 2)
		)
		robotTag.appendChild(joint_foot_right.getJointElement())
		
		if(donwload==true){
			
			let fileContent = new XMLSerializer().serializeToString(robotTag);
			let fileContentFormatted = this.prettifyXml(fileContent);
			console.log("XML from script: ");
			console.log(fileContentFormatted);
		
			var element = document.createElement('a');
			element.setAttribute('href', 'data:Application/octet-stream,' + encodeURIComponent(fileContentFormatted));
			element.setAttribute('download', 'droid_x.urdf');
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
			
		} else {
			
			let fileContent = new XMLSerializer().serializeToString(robotTag);
			let fileContentFormatted = this.prettifyXml(fileContent);
			console.log("XML from script: ");
			console.log(fileContentFormatted);	
		}
	}
	
	// Create a CSV file containing a Droid's encoded genes
	toCSV(){
		let encodedGenes = this.genome.encodeGenes(this.genesDecoded, this.genome.geneSpec);
		let csvContent = encodedGenes.toString();

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
		const objUrl = URL.createObjectURL(blob)
		const element = document.createElement('a')
		element.setAttribute('href', objUrl)
		element.setAttribute("download", "droid_x.csv");
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}
	
	// Give the XML code nested indentation
	prettifyXml(sourceXml){
		
		var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
		var xsltDoc = new DOMParser().parseFromString([
			// describes how we want to modify the XML - indent everything
			'<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
			'  <xsl:strip-space elements="*"/>',
			'  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
			'    <xsl:value-of select="normalize-space(.)"/>',
			'  </xsl:template>',
			'  <xsl:template match="node()|@*">',
			'    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
			'  </xsl:template>',
			'  <xsl:output indent="yes"/>',
			'</xsl:stylesheet>',
		].join('\n'), 'application/xml');

		var xsltProcessor = new XSLTProcessor();    
		xsltProcessor.importStylesheet(xsltDoc);
		var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
		var resultXml = new XMLSerializer().serializeToString(resultDoc);
		return '<?xml version="1.0" ?>'+resultXml;
	}
  
}
