import tornado.web
from gcm import GCM
import json
import random
import pdb;
import datetime
import os

class StaticFileHandler(tornado.web.RequestHandler):
	"""A simple handler that can serve static content from a directory.

	To map a path to this handler for a static data directory /var/www,
	you would add a line to your application like:

		application = web.Application([
			(r"/static/(.*)", web.StaticFileHandler, {"path": "/var/www"}),
		])

	The local root directory of the content should be passed as the "path"
	argument to the handler.

	To support aggressive browser caching, if the argument "v" is given
	with the path, we set an infinite HTTP expiration header. So, if you
	want browsers to cache a file indefinitely, send them to, e.g.,
	/static/images/myimage.png?v=xxx.
	"""
	def initialize(self, path, default_filename=None):
		self.root = os.path.abspath(path) + os.path.sep
		self.default_filename = default_filename
 
	def head(self, path):
		self.get(path, include_body=False)
 
	def get(self, path, include_body=True):
		if path == '':
			path = 'index.html'
		if os.path.sep != "/":
			path = path.replace("/", os.path.sep)
		
		abspath = os.path.join(self.root, path)
			
		try:
			file = open(abspath, "rb")
			self.write(file.read())
			file.close()
		except:
			pass
 
	def set_extra_headers(self, path):
		"""For subclass to add extra headers to the response"""
		pass
		
gcm = GCM("AIzaSyAK0auMIdE5LBDnIoUYFAtC0HjqgZOxYGs");

class GCMHandler(tornado.web.RequestHandler):
	def post(self):
		data = json.loads(self.request.body);
		print 'Sending Notification %s To %s'%(str(data['message']),str(data['regIds']));
		self.send_message(data['regIds'],data['message']);
		self.finish()
		
	def send_message(self,ids,message):
		if(type(ids) == type([])):
			for id in ids:
				gcm.plaintext_request(id,{'message' : message,'notId':str(random.randint(0,100000))});
		else:
			gcm.plaintext_request(ids,{'message' : message,'notId':str(random.randint(0,100000))});
		