from gcm import GCM
import random

gcm = GCM("AIzaSyAK0auMIdE5LBDnIoUYFAtC0HjqgZOxYGs");

def send_message(ids,message):
	global gcm
	if(type(ids) == type([])):
		for id in ids:
			gcm.plaintext_request(ids,{'message' : message,'notId':str(random.randInt(0,100000))});
	else:
		gcm.plaintext_request(ids,{'message' : message,'notId':str(random.randInt(0,100000))});