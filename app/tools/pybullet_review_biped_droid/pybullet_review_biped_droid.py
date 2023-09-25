import pybullet as p
import pybullet_data as pd
import numpy as np
import time 
import os
import math

# Connect
p.connect(p.GUI)
p.setPhysicsEngineParameter(enableFileCaching=0)
p.configureDebugVisualizer(p.COV_ENABLE_GUI, 0)

# Create a floor
floor_shape = p.createCollisionShape(p.GEOM_PLANE)
floor = p.createMultiBody(floor_shape, floor_shape)

# Path setting
p.setAdditionalSearchPath(pd.getDataPath())

# Note 
# You need to put the file in path: ~/site-packages/pybullet_data/
droid = p.loadURDF('droid_x1.urdf')

# Set sim values
p.setGravity(0, 0, -10)
p.setRealTimeSimulation(1)

# Air drop it
p.resetBasePositionAndOrientation(droid,[0,0,1],[0,0,0,1])
start_pos, orn = p.getBasePositionAndOrientation(droid)

# This is needed to update the last time a motor direction change happened for each motor 
motorSets = []
motorDirections = []

# Review the joints
num_joints = p.getNumJoints(droid)
if num_joints > 0:

	print("-------------------------------------")
	print(" ")
	print("Joint names: ")
	print(" ")

	# Print all the joint names and init the motorSets array
	for i in range(num_joints):
		joint_info = p.getJointInfo(droid, i)
		joint_name = joint_info[1].decode("UTF-8")
		joint_type = joint_info[2]
		motorSets.append(0)
		motorDirections.append(1)
		print(joint_name)

# Iterate 
elapsed_time = 0
wait_time = 1.0/240 # seconds
total_time = 300 # seconds

# Sim vars
secondsStarted = 0
secondsPassed = 0
step = 0

# Start
while True:
	
	# Step
	p.stepSimulation()
	step += 1

	if secondsStarted==0:
		secondsStarted = time.time()
	else:
		secondsPassed = time.time() - secondsStarted

	if step % 24 == 0:
		
		for i in range(num_joints):
			
			joint_info = p.getJointInfo(droid, i)
			joint_name = joint_info[1].decode("UTF-8")
			#print(joint_name )

			metaData = joint_name.split("metadata",1)[1]

			# Check that the joint tags have names like this: <joint name="leg_left_to_body_metadata_motorstartdelay_1000_motorfreqdelay_500" >
			if metaData:
				metaDataArray = metaData.split("_")
			else:
				print("No metadata in joint name")
				break

			motorstartdelay = metaDataArray[2]
			motorfreqdelay = metaDataArray[4]
			
			# joint_info[11] = 'velocity' from the limit tag in the joint tag
			motorSpeed = joint_info[11]

			motorstartdelaySeconds = int(motorstartdelay)/1000
			motorfreqdelaySeconds = int(motorfreqdelay)/1000

			if secondsPassed >= motorstartdelaySeconds:

				if motorSets[i] == 0:

					print("First motors set")
					p.setJointMotorControl2(droid, i, controlMode = p.VELOCITY_CONTROL, targetVelocity = motorSpeed * motorDirections[i])
					motorSets[i] = time.time()
				
				else:
				
					secondsPassedMotorSet = time.time() - motorSets[i]

					if secondsPassedMotorSet >= motorfreqdelaySeconds:
						
						#print("Time to switch direction")
						if motorDirections[i] == 1:
							#print("Switch to -1")
							motorDirections[i] = -1
						else:
							#print("Switch to 1")
							motorDirections[i] = 1
						
						p.setJointMotorControl2(droid, i, controlMode = p.VELOCITY_CONTROL, targetVelocity = motorSpeed * motorDirections[i])
						motorSets[i] = time.time()
			else:
				p.setJointMotorControl2(droid, i, controlMode = p.VELOCITY_CONTROL, targetVelocity = 0)

		# New position
		new_pos, orn = p.getBasePositionAndOrientation(droid)
		#p.resetDebugVisualizerCamera(5, 0, 200, new_pos)
		
		# Distance moved
		dist_moved = np.linalg.norm(np.asarray(start_pos) - np.asarray(new_pos))
		
		#print(dist_moved)

	time.sleep(wait_time)
	elapsed_time += wait_time

	if elapsed_time > total_time:
		break

print(" ")
print("TOTAL DISTANCE MOVED:", dist_moved)

while (p.isConnected()):p.stepSimulation()

#######