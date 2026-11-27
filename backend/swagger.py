from flasgger import Swagger

def init_swagger(app):
    def rule_filter(rule):
        # Only document public API routes; keep moderator/admin-only routes out of Swagger.
        if not rule.rule.startswith('/api/'):
            return False

        if rule.rule.startswith('/api/posts/update'):
            return False
        if rule.rule.startswith('/api/posts/delete'):
            return False

        return True

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
                        "description": "Primary emotion tag of the post (Anxious, Overwhelmed, Hopeful, Empowered, Frustrated, Angry, Concerned, Sad/Grief, Motivated, Inspired, Determined, Resilient, Fearful, Curious)",
                    },
                    "optionalTags": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        },
                        "description": "Optional list of additional tags associated with the post",
                    },
                    "storyPrompt": {
                        "type": "string",
                        "description": "Optional story prompt chosen by the author",
                    },
                    "captchaToken": {
                        "type": "string",
                        "description": "CAPTCHA verification token",
                    },
                },
            }
        },
    }

    swagger_config = {
        "specs_route": "/apidocs/",
        # Flasgger expects an iterable here; omit -> None -> crash in after_request.
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec_1",
                "route": "/apispec_1.json",
                "rule_filter": rule_filter,
                "model_filter": lambda tag: True,
            }
        ],
    }

    Swagger(app, config=swagger_config, template=swagger_template)