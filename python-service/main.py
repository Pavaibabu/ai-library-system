from flask import Flask
from flask_cors import CORS
from search_api import register_search_routes
from recommendation_api import register_recommendation_routes
from chat import register_chat_routes

app=Flask(__name__)
CORS(app)

register_search_routes(app)
register_recommendation_routes(app)
register_chat_routes(app)

if __name__=='__main__':
    app.run(port=5000,debug=True,host='')