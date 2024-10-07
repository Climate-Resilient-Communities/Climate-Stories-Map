import datetime
from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from marshmallow import Schema, fields, ValidationError
from flask_cors import CORS
import pdb
import os

app = Flask(__name__)
CORS(app)

# Check if running locally
if os.path.exists('.env'):
    from dotenv import load_dotenv
    load_dotenv()  # Load environment variables from .env file

# Now retrieve the MongoDB URI
mongo_uri = os.getenv('MONGODB_URI')

# Configure MongoDB
app.config["MONGO_URI"] = mongo_uri  # Change this to your MongoDB URI
mongo = PyMongo(app)
collection = mongo.db.stories

# Define the schema for input validation using Marshmallow
class PostSchema(Schema):
    title = fields.Str(required=True)
    content = fields.Dict(required=True)
    location = fields.Dict(required=True)
    tags = fields.List(fields.Str(), required=True)
    created_at = fields.DateTime()

# Define a schema for tag validation
class TagSchema(Schema):
    tags = fields.List(fields.Str(), required=False, allow_none=True)

# Initialize the schema instance
post_schema = PostSchema()
tag_schema = TagSchema()

# CREATE (Insert a new document)
# Route to create a new post document
@app.route('/posts/create', methods=['POST'])
def create():
    try:
        # Validate and deserialize the request JSON
        data = post_schema.load(request.json)
        data['created_at'] = datetime.datetime.now(datetime.timezone.utc)  # Add created_at timestamp

        # Insert the sanitized data into the collection
        result = collection.insert_one(data)
        
        return jsonify({'message': 'Post created', 'post_id': str(result.inserted_id)}), 201
    
    except ValidationError as err:
        # Return error messages in case of validation failure
        return jsonify({'errors': err.messages}), 400

# Example route to retrieve all posts
@app.route('/posts', methods=['GET'])
def get_posts():
    #documents = list(collection.find())
    #for document in documents:
        #document['_id'] = str(document['_id'])  # Convert ObjectId to string
    try:
        # Validate query parameters for tags
        raw_tags = request.args.getlist('tags')  # This returns a list directly
        
        # Validate and load the tags
        args = tag_schema.load({'tags': raw_tags})  # Pass as a dictionary
        tags = args.get('tags', [])

        query = {}
        if tags:
            # Use $all to match all specified tags
            query['tags'] = {'$all': tags}
        
        posts = list(collection.find(query, {'_id': 0}))
        return jsonify(posts), 200

    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

# UPDATE (Modify a document by ID)
@app.route('/posts/update/<id>', methods=['PUT'])
def update_post(id):
    try:
        # Validate the post_id to ensure it's a valid ObjectId
        if not ObjectId.is_valid(id):
            return jsonify({'error': 'Invalid post ID'}), 400

        # Validate and deserialize the request JSON
        data = post_schema.load(request.json)
        data['updated_at'] = datetime.datetime.now(datetime.timezone.utc)  # Add updated_at timestamp

        # Find the post and update it
        result = collection.update_one(
            {'_id': ObjectId(id)},
            {'$set': data}
        )

        if result.matched_count == 0:
            return jsonify({'message': 'Post not found'}), 404

        return jsonify({'message': 'Post updated'}), 200
    
    except ValidationError as err:
        # Return error messages in case of validation failure
        return jsonify({'errors': err.messages}), 400

# DELETE (Delete a document by ID)
@app.route('/posts/delete/<id>', methods=['DELETE'])
def delete_post(id):
    try:
        # Validate the post_id to ensure it's a valid ObjectId
        if not ObjectId.is_valid(id):
            return jsonify({'error': 'Invalid post ID'}), 400

        # Find the post and delete it
        result = collection.delete_one({'_id': ObjectId(id)})

        if result.deleted_count == 0:
            return jsonify({'message': 'Post not found'}), 404

        return jsonify({'message': 'Post deleted'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
