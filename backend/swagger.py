from flasgger import Swagger

def init_swagger(app):
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "Post API",
            "version": "1.0.0",
        },
        "definitions": {
            "Post": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Title of the post",
                    },
                    "content": {
                        "type": "object",
                        "description": "Content of the post",
                    },
                    "location": {
                        "type": "object",
                        "description": "Location information",
                    },
                    "tag": {
                        "type": "string",
                        "description": "Primary tag of the post (Positive, Neutral, or Negative)",
                    },
                    "optionalTags": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        },
                        "description": "Optional list of additional tags associated with the post",
                    },
                    "captchaToken": {
                        "type": "string",
                        "description": "CAPTCHA verification token",
                    },
                },
            }
        },
    }

    Swagger(app, template=swagger_template)