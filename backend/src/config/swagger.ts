import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Mchichat API",
            version: "1.0.0",
            description:
                "Documentation complète de l'API REST Mchichat : authentification, profils, amis, salons, invitations, messages, conversations privées, posts, GIFs, news et météo.",
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1",
                description: "Serveur local",
            },
            {
                url: "https://mchichat.onrender.com/api/v1",
                description: "Serveur production Render",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: "Health" },
            { name: "Auth" },
            { name: "Profiles" },
            { name: "Friends" },
            { name: "Salons" },
            { name: "Salon invitations" },
            { name: "Messages" },
            { name: "Private messages" },
            { name: "Posts" },
            { name: "Giphy" },
            { name: "External APIs" },
        ],
        paths: {
            "/health": {
                get: {
                    tags: ["Health"],
                    summary: "Vérifier que l'API fonctionne",
                    security: [],
                    responses: {
                        200: {
                            description: "API opérationnelle",
                        },
                    },
                },
            },

            "/auth/register": {
                post: {
                    tags: ["Auth"],
                    summary: "Inscription d'un utilisateur",
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: [
                                        "email",
                                        "username",
                                        "password",
                                        "firstName",
                                        "lastName",
                                    ],
                                    properties: {
                                        email: {
                                            type: "string",
                                            example: "test@test.com",
                                        },
                                        username: {
                                            type: "string",
                                            example: "testuser",
                                        },
                                        password: {
                                            type: "string",
                                            example: "password123",
                                        },
                                        firstName: {
                                            type: "string",
                                            example: "Aya",
                                        },
                                        lastName: {
                                            type: "string",
                                            example: "Touhaf",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Utilisateur créé" },
                        400: { description: "Erreur de validation" },
                    },
                },
            },

            "/auth/login": {
                post: {
                    tags: ["Auth"],
                    summary: "Connexion utilisateur",
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["email", "password"],
                                    properties: {
                                        email: {
                                            type: "string",
                                            example: "test@test.com",
                                        },
                                        password: {
                                            type: "string",
                                            example: "password123",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Connexion réussie" },
                        401: { description: "Email ou mot de passe incorrect" },
                    },
                },
            },

            "/auth/me": {
                get: {
                    tags: ["Auth"],
                    summary: "Récupérer l'utilisateur connecté",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Utilisateur connecté" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/profiles/{username}": {
                get: {
                    tags: ["Profiles"],
                    summary: "Récupérer le profil d'un utilisateur",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "username",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                            example: "testuser",
                        },
                    ],
                    responses: {
                        200: { description: "Profil récupéré" },
                        404: { description: "Profil introuvable" },
                    },
                },
            },

            "/profiles/me/settings": {
                put: {
                    tags: ["Profiles"],
                    summary: "Modifier son profil",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: false,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        firstName: { type: "string" },
                                        lastName: { type: "string" },
                                        username: { type: "string" },
                                        bio: { type: "string" },
                                        avatar: {
                                            type: "string",
                                            format: "binary",
                                        },
                                        banner: {
                                            type: "string",
                                            format: "binary",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Profil mis à jour" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/profiles/me": {
                delete: {
                    tags: ["Profiles"],
                    summary: "Supprimer son compte",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Compte supprimé" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/friends/search": {
                get: {
                    tags: ["Friends"],
                    summary: "Rechercher des utilisateurs",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "username",
                            in: "query",
                            required: true,
                            schema: { type: "string" },
                            example: "aya",
                        },
                    ],
                    responses: {
                        200: { description: "Utilisateurs trouvés" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/friends/requests": {
                post: {
                    tags: ["Friends"],
                    summary: "Envoyer une demande d'ami",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["receiverId"],
                                    properties: {
                                        receiverId: {
                                            type: "string",
                                            example: "user-id",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Demande envoyée" },
                        400: { description: "Erreur de validation" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/friends/requests/received": {
                get: {
                    tags: ["Friends"],
                    summary: "Lister les demandes d'amis reçues",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Demandes reçues récupérées" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/friends/requests/sent": {
                get: {
                    tags: ["Friends"],
                    summary: "Lister les demandes d'amis envoyées",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Demandes envoyées récupérées" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/friends/requests/{requestId}": {
                patch: {
                    tags: ["Friends"],
                    summary: "Accepter ou refuser une demande d'ami",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "requestId",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["status"],
                                    properties: {
                                        status: {
                                            type: "string",
                                            enum: ["ACCEPTED", "REJECTED"],
                                            example: "ACCEPTED",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Demande traitée" },
                        401: { description: "Non autorisé" },
                        404: { description: "Demande introuvable" },
                    },
                },
            },

            "/friends": {
                get: {
                    tags: ["Friends"],
                    summary: "Lister les amis",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Liste des amis" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/friends/{friendId}": {
                delete: {
                    tags: ["Friends"],
                    summary: "Supprimer un ami",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "friendId",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Ami supprimé" },
                        401: { description: "Non autorisé" },
                        404: { description: "Ami introuvable" },
                    },
                },
            },

            "/salons": {
                get: {
                    tags: ["Salons"],
                    summary: "Lister les salons accessibles",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Liste des salons" },
                        401: { description: "Non autorisé" },
                    },
                },
                post: {
                    tags: ["Salons"],
                    summary: "Créer un salon",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["name", "visibility"],
                                    properties: {
                                        name: {
                                            type: "string",
                                            example: "Général",
                                        },
                                        description: {
                                            type: "string",
                                            example: "Salon principal",
                                        },
                                        visibility: {
                                            type: "string",
                                            enum: ["PUBLIC", "PRIVATE"],
                                            example: "PUBLIC",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Salon créé" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/salons/{id}": {
                get: {
                    tags: ["Salons"],
                    summary: "Récupérer les détails d'un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Salon récupéré" },
                        401: { description: "Non autorisé" },
                        404: { description: "Salon introuvable" },
                    },
                },
                put: {
                    tags: ["Salons"],
                    summary: "Modifier un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: false,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        description: { type: "string" },
                                        visibility: {
                                            type: "string",
                                            enum: ["PUBLIC", "PRIVATE"],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Salon modifié" },
                        401: { description: "Non autorisé" },
                        403: { description: "Accès refusé" },
                        404: { description: "Salon introuvable" },
                    },
                },
                delete: {
                    tags: ["Salons"],
                    summary: "Supprimer un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Salon supprimé" },
                        401: { description: "Non autorisé" },
                        403: { description: "Accès refusé" },
                        404: { description: "Salon introuvable" },
                    },
                },
            },

            "/salons/{id}/membership-requests": {
                post: {
                    tags: ["Salons"],
                    summary: "Demander à rejoindre un salon public",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        201: { description: "Demande d'adhésion créée" },
                        401: { description: "Non autorisé" },
                        404: { description: "Salon introuvable" },
                    },
                },
            },

            "/salons/membership-requests": {
                get: {
                    tags: ["Salons"],
                    summary: "Lister les demandes d'adhésion reçues pour ses salons",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Demandes récupérées" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/salons/membership-requests/{requestId}/accept": {
                post: {
                    tags: ["Salons"],
                    summary: "Accepter une demande d'adhésion à un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "requestId",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Demande acceptée" },
                        401: { description: "Non autorisé" },
                        404: { description: "Demande introuvable" },
                    },
                },
            },

            "/salons/membership-requests/{requestId}/reject": {
                post: {
                    tags: ["Salons"],
                    summary: "Refuser une demande d'adhésion à un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "requestId",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Demande refusée" },
                        401: { description: "Non autorisé" },
                        404: { description: "Demande introuvable" },
                    },
                },
            },

            "/salons/{id}/invite": {
                post: {
                    tags: ["Salon invitations"],
                    summary: "Inviter un ami dans un salon privé",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["receiverId"],
                                    properties: {
                                        receiverId: {
                                            type: "string",
                                            example: "user-id",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Invitation envoyée" },
                        401: { description: "Non autorisé" },
                        403: { description: "Accès refusé" },
                        404: { description: "Salon ou utilisateur introuvable" },
                    },
                },
            },

            "/salon-invitations": {
                get: {
                    tags: ["Salon invitations"],
                    summary: "Lister mes invitations de salon",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Invitations récupérées" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/salon-invitations/{id}/accept": {
                post: {
                    tags: ["Salon invitations"],
                    summary: "Accepter une invitation de salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Invitation acceptée" },
                        401: { description: "Non autorisé" },
                        404: { description: "Invitation introuvable" },
                    },
                },
            },

            "/salon-invitations/{id}/reject": {
                post: {
                    tags: ["Salon invitations"],
                    summary: "Refuser une invitation de salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Invitation refusée" },
                        401: { description: "Non autorisé" },
                        404: { description: "Invitation introuvable" },
                    },
                },
            },

            "/messages/salon/{id}": {
                get: {
                    tags: ["Messages"],
                    summary: "Récupérer les messages d'un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Messages récupérés" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/messages": {
                post: {
                    tags: ["Messages"],
                    summary: "Envoyer un message dans un salon",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: false,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        salonId: { type: "string" },
                                        content: { type: "string" },
                                        attachment: {
                                            type: "string",
                                            format: "binary",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Message envoyé" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/messages/{id}": {
                patch: {
                    tags: ["Messages"],
                    summary: "Modifier un message de salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["content"],
                                    properties: {
                                        content: {
                                            type: "string",
                                            example: "Message modifié",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Message modifié" },
                        401: { description: "Non autorisé" },
                        403: { description: "Accès refusé" },
                        404: { description: "Message introuvable" },
                    },
                },
                delete: {
                    tags: ["Messages"],
                    summary: "Supprimer un message de salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Message supprimé" },
                        401: { description: "Non autorisé" },
                        403: { description: "Accès refusé" },
                        404: { description: "Message introuvable" },
                    },
                },
            },

            "/private-conversations": {
                get: {
                    tags: ["Private messages"],
                    summary: "Lister les conversations privées",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Conversations récupérées" },
                        401: { description: "Non autorisé" },
                    },
                },
                post: {
                    tags: ["Private messages"],
                    summary: "Créer une conversation privée",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["friendId"],
                                    properties: {
                                        friendId: {
                                            type: "string",
                                            example: "friend-user-id",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Conversation créée" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/private-conversations/{id}/messages": {
                get: {
                    tags: ["Private messages"],
                    summary: "Récupérer les messages privés",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Messages privés récupérés" },
                        401: { description: "Non autorisé" },
                    },
                },
                post: {
                    tags: ["Private messages"],
                    summary: "Envoyer un message privé",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: false,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        content: { type: "string" },
                                        gifUrl: { type: "string" },
                                        attachment: {
                                            type: "string",
                                            format: "binary",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Message privé envoyé" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/private-messages/{id}": {
                patch: {
                    tags: ["Private messages"],
                    summary: "Modifier un message privé",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["content"],
                                    properties: {
                                        content: {
                                            type: "string",
                                            example: "Message privé modifié",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Message privé modifié" },
                        401: { description: "Non autorisé" },
                        403: { description: "Accès refusé" },
                        404: { description: "Message privé introuvable" },
                    },
                },
                delete: {
                    tags: ["Private messages"],
                    summary: "Supprimer un message privé",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Message privé supprimé" },
                        401: { description: "Non autorisé" },
                        403: { description: "Accès refusé" },
                        404: { description: "Message privé introuvable" },
                    },
                },
            },

            "/posts": {
                get: {
                    tags: ["Posts"],
                    summary: "Lister les publications",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Publications récupérées" },
                        401: { description: "Non autorisé" },
                    },
                },
                post: {
                    tags: ["Posts"],
                    summary: "Créer une publication",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: false,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        content: {
                                            type: "string",
                                            example: "Contenu de la publication",
                                        },
                                        media: {
                                            type: "string",
                                            format: "binary",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Publication créée" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/posts/{id}": {
                put: {
                    tags: ["Posts"],
                    summary: "Modifier une publication",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: false,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        content: {
                                            type: "string",
                                            example: "Publication modifiée",
                                        },
                                        media: {
                                            type: "string",
                                            format: "binary",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Publication modifiée" },
                        401: { description: "Non autorisé" },
                        403: { description: "Accès refusé" },
                        404: { description: "Publication introuvable" },
                    },
                },
                delete: {
                    tags: ["Posts"],
                    summary: "Supprimer une publication",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Publication supprimée" },
                        401: { description: "Non autorisé" },
                        403: { description: "Accès refusé" },
                        404: { description: "Publication introuvable" },
                    },
                },
            },

            "/posts/{id}/like": {
                post: {
                    tags: ["Posts"],
                    summary: "Liker ou retirer le like d'une publication",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        200: { description: "Like ajouté ou retiré" },
                        401: { description: "Non autorisé" },
                        404: { description: "Publication introuvable" },
                    },
                },
            },

            "/posts/{id}/comments": {
                post: {
                    tags: ["Posts"],
                    summary: "Ajouter un commentaire à une publication",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        content: {
                                            type: "string",
                                            example: "Très bon post !",
                                        },
                                        gifUrl: {
                                            type: "string",
                                            example:
                                                "https://media.giphy.com/media/example/giphy.gif",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Commentaire ajouté" },
                        401: { description: "Non autorisé" },
                        404: { description: "Publication introuvable" },
                    },
                },
            },

            "/giphy/search": {
                get: {
                    tags: ["Giphy"],
                    summary: "Rechercher des GIFs via l'API Giphy",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "q",
                            in: "query",
                            required: true,
                            schema: { type: "string" },
                            example: "cat",
                        },
                    ],
                    responses: {
                        200: { description: "GIFs récupérés" },
                        400: { description: "Paramètre q manquant" },
                        401: { description: "Non autorisé" },
                    },
                },
            },

            "/news": {
                get: {
                    tags: ["External APIs"],
                    summary: "Récupérer les actualités via NewsData.io",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Actualités récupérées" },
                    },
                },
            },

            "/weather": {
                get: {
                    tags: ["External APIs"],
                    summary: "Récupérer la météo",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "latitude",
                            in: "query",
                            required: false,
                            schema: { type: "number" },
                            example: 50.6292,
                        },
                        {
                            name: "longitude",
                            in: "query",
                            required: false,
                            schema: { type: "number" },
                            example: 3.0573,
                        },
                    ],
                    responses: {
                        200: { description: "Météo récupérée" },
                    },
                },
            },
        },
    },
    apis: [],
});