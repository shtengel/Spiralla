import tornado.ioloop
import tornado.web
import handlers
import os
path = os.path.abspath(os.path.dirname(__file__))
staticPath = os.path.join(os.path.dirname(path),'scheduleApp')

settings = {
    'debug': True, 
    'static_path': staticPath}

handlers = [
    (r"/gcm/sendNotification", handlers.GCMHandler),
    (r'/(.*)', handlers.StaticFileHandler,{"path" : os.path.join(staticPath,'www')})]

application = tornado.web.Application(handlers, **settings)


if __name__ == "__main__":
    application.listen(8000)
    tornado.ioloop.IOLoop.instance().start()