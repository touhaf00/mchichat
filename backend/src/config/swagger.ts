import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Mchichat API",
            version: "1.0.0",
            description:
                "Documentation complète de l'API REST Mchichat : auth, profils, amis, salons, messages, posts, admin, GIFs, news et météo.",
        },
        servers: [
            { url: "http://localhost:5000/api/v1", description: "Local" },
            { url: "https://mchichat.onrender.com/api/v1", description: "Production Render" },
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
            { name: "Admin" },
            { name: "Giphy" },
            { name: "External APIs" },
        ],
        paths: {
            "/health": {
                get: {
                    tags: ["Health"],
                    summary: "Vérifier l'état de l'API",
                    security: [],
                    responses: { 200: { description: "API opérationnelle" } },
                },
            },

            "/auth/register": {
                post: {
                    tags: ["Auth"],
                    summary: "Inscription",
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["email", "username", "password", "firstName", "lastName"],
                                    properties: {
                                        email: { type: "string", example: "test@test.com" },
                                        username: { type: "string", example: "testuser" },
                                        password: { type: "string", example: "password123" },
                                        firstName: { type: "string", example: "Aya" },
                                        lastName: { type: "string", example: "Touhaf" },
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
                    summary: "Connexion",
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["email", "password"],
                                    properties: {
                                        email: { type: "string", example: "test@test.com" },
                                        password: { type: "string", example: "password123" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Connexion réussie avec accessToken" },
                        401: { description: "Email ou mot de passe incorrect" },
                    },
                },
            },

            "/auth/refresh": {
                post: {
                    tags: ["Auth"],
                    summary: "Renouveler l'access token via refresh token httpOnly",
                    security: [],
                    responses: {
                        200: { description: "Nouveau accessToken généré" },
                        401: { description: "Refresh token invalide ou expiré" },
                    },
                },
            },

            "/auth/logout": {
                post: {
                    tags: ["Auth"],
                    summary: "Déconnexion et suppression du cookie refresh token",
                    security: [],
                    responses: {
                        200: { description: "Déconnexion réussie" },
                    },
                },
            },

            "/auth/me": {
                get: {
                    tags: ["Auth"],
                    summary: "Utilisateur connecté",
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
                    summary: "Récupérer un profil",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "username", in: "path", required: true, schema: { type: "string" } },
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
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        firstName: { type: "string" },
                                        lastName: { type: "string" },
                                        username: { type: "string" },
                                        bio: { type: "string" },
                                        avatar: { type: "string", format: "binary" },
                                        banner: { type: "string", format: "binary" },
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
                        { name: "username", in: "query", required: true, schema: { type: "string" } },
                    ],
                    responses: { 200: { description: "Utilisateurs trouvés" } },
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
                                    properties: { receiverId: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: { 201: { description: "Demande envoyée" } },
                },
            },

            "/friends/requests/received": {
                get: {
                    tags: ["Friends"],
                    summary: "Demandes d'amis reçues",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Demandes récupérées" } },
                },
            },

            "/friends/requests/sent": {
                get: {
                    tags: ["Friends"],
                    summary: "Demandes d'amis envoyées",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Demandes récupérées" } },
                },
            },

            "/friends/requests/{requestId}": {
                patch: {
                    tags: ["Friends"],
                    summary: "Accepter ou refuser une demande",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "requestId", in: "path", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["status"],
                                    properties: {
                                        status: { type: "string", enum: ["ACCEPTED", "REJECTED"] },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: "Demande traitée" } },
                },
            },

            "/friends": {
                get: {
                    tags: ["Friends"],
                    summary: "Lister les amis",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Liste des amis" } },
                },
            },

            "/friends/{friendId}": {
                delete: {
                    tags: ["Friends"],
                    summary: "Supprimer un ami",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "friendId", in: "path", required: true, schema: { type: "string" } },
                    ],
                    responses: { 200: { description: "Ami supprimé" } },
                },
            },

            "/salons": {
                get: {
                    tags: ["Salons"],
                    summary: "Lister les salons",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Liste des salons" } },
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
                                        name: { type: "string" },
                                        description: { type: "string" },
                                        visibility: { type: "string", enum: ["PUBLIC", "PRIVATE"] },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 201: { description: "Salon créé" } },
                },
            },

            "/salons/{id}": {
                get: {
                    tags: ["Salons"],
                    summary: "Détails d'un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Salon récupéré" } },
                },
                put: {
                    tags: ["Salons"],
                    summary: "Modifier un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Salon modifié" } },
                },
                delete: {
                    tags: ["Salons"],
                    summary: "Supprimer un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Salon supprimé" } },
                },
            },

            "/salons/{id}/membership-requests": {
                post: {
                    tags: ["Salons"],
                    summary: "Demander à rejoindre un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 201: { description: "Demande créée" } },
                },
            },

            "/salons/membership-requests": {
                get: {
                    tags: ["Salons"],
                    summary: "Lister les demandes d'adhésion",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Demandes récupérées" } },
                },
            },

            "/salons/membership-requests/{requestId}/accept": {
                post: {
                    tags: ["Salons"],
                    summary: "Accepter une demande d'adhésion",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "requestId", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Demande acceptée" } },
                },
            },

            "/salons/membership-requests/{requestId}/reject": {
                post: {
                    tags: ["Salons"],
                    summary: "Refuser une demande d'adhésion",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "requestId", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Demande refusée" } },
                },
            },

            "/salons/{id}/invite": {
                post: {
                    tags: ["Salon invitations"],
                    summary: "Inviter un utilisateur dans un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["receiverId"],
                                    properties: { receiverId: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: { 201: { description: "Invitation envoyée" } },
                },
            },

            "/salon-invitations": {
                get: {
                    tags: ["Salon invitations"],
                    summary: "Lister mes invitations",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Invitations récupérées" } },
                },
            },

            "/salon-invitations/{id}/accept": {
                post: {
                    tags: ["Salon invitations"],
                    summary: "Accepter une invitation",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Invitation acceptée" } },
                },
            },

            "/salon-invitations/{id}/reject": {
                post: {
                    tags: ["Salon invitations"],
                    summary: "Refuser une invitation",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Invitation refusée" } },
                },
            },

            "/messages/salon/{id}": {
                get: {
                    tags: ["Messages"],
                    summary: "Messages d'un salon",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Messages récupérés" } },
                },
            },

            "/messages": {
                post: {
                    tags: ["Messages"],
                    summary: "Envoyer un message de salon",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        salonId: { type: "string" },
                                        content: { type: "string" },
                                        attachment: { type: "string", format: "binary" },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 201: { description: "Message envoyé" } },
                },
            },

            "/messages/{id}": {
                patch: {
                    tags: ["Messages"],
                    summary: "Modifier un message",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Message modifié" } },
                },
                delete: {
                    tags: ["Messages"],
                    summary: "Supprimer un message",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Message supprimé" } },
                },
            },

            "/private-conversations": {
                get: {
                    tags: ["Private messages"],
                    summary: "Lister conversations privées",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Conversations récupérées" } },
                },
                post: {
                    tags: ["Private messages"],
                    summary: "Créer conversation privée",
                    security: [{ bearerAuth: [] }],
                    responses: { 201: { description: "Conversation créée" } },
                },
            },

            "/private-conversations/{id}/messages": {
                get: {
                    tags: ["Private messages"],
                    summary: "Messages privés",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Messages privés récupérés" } },
                },
                post: {
                    tags: ["Private messages"],
                    summary: "Envoyer message privé",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 201: { description: "Message privé envoyé" } },
                },
            },

            "/private-messages/{id}": {
                patch: {
                    tags: ["Private messages"],
                    summary: "Modifier message privé",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Message privé modifié" } },
                },
                delete: {
                    tags: ["Private messages"],
                    summary: "Supprimer message privé",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Message privé supprimé" } },
                },
            },

            "/posts": {
                get: {
                    tags: ["Posts"],
                    summary: "Lister les publications",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Publications récupérées" } },
                },
                post: {
                    tags: ["Posts"],
                    summary: "Créer une publication",
                    security: [{ bearerAuth: [] }],
                    responses: { 201: { description: "Publication créée" } },
                },
            },

            "/posts/{id}": {
                put: {
                    tags: ["Posts"],
                    summary: "Modifier une publication",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Publication modifiée" } },
                },
                delete: {
                    tags: ["Posts"],
                    summary: "Supprimer une publication",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Publication supprimée" } },
                },
            },

            "/posts/{id}/like": {
                post: {
                    tags: ["Posts"],
                    summary: "Liker ou retirer le like",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Like mis à jour" } },
                },
            },

            "/posts/{id}/comments": {
                post: {
                    tags: ["Posts"],
                    summary: "Ajouter un commentaire",
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 201: { description: "Commentaire ajouté" } },
                },
            },

            "/admin/stats": {
                get: {
                    tags: ["Admin"],
                    summary: "Statistiques globales admin",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Statistiques récupérées" },
                        403: { description: "Accès réservé aux administrateurs" },
                    },
                },
            },

            "/admin/users": {
                get: {
                    tags: ["Admin"],
                    summary: "Lister tous les utilisateurs",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: "Utilisateurs récupérés" },
                        403: { description: "Accès réservé aux administrateurs" },
                    },
                },
            },

            "/admin/users/{userId}/role": {
                patch: {
                    tags: ["Admin"],
                    summary: "Modifier le rôle d'un utilisateur",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "userId", in: "path", required: true, schema: { type: "string" } },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["role"],
                                    properties: {
                                        role: {
                                            type: "string",
                                            enum: ["USER", "ADMIN"],
                                            example: "ADMIN",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Rôle mis à jour" },
                        403: { description: "Accès réservé aux administrateurs" },
                        404: { description: "Utilisateur introuvable" },
                    },
                },
            },

            "/admin/users/{userId}": {
                delete: {
                    tags: ["Admin"],
                    summary: "Supprimer un utilisateur",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "userId", in: "path", required: true, schema: { type: "string" } },
                    ],
                    responses: {
                        200: { description: "Utilisateur supprimé" },
                        403: { description: "Accès réservé aux administrateurs" },
                        404: { description: "Utilisateur introuvable" },
                    },
                },
            },

            "/giphy/search": {
                get: {
                    tags: ["Giphy"],
                    summary: "Rechercher des GIFs",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: "q", in: "query", required: true, schema: { type: "string" } },
                    ],
                    responses: { 200: { description: "GIFs récupérés" } },
                },
            },

            "/news": {
                get: {
                    tags: ["External APIs"],
                    summary: "Actualités NewsData.io",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Actualités récupérées" } },
                },
            },

            "/weather": {
                get: {
                    tags: ["External APIs"],
                    summary: "Météo",
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: "Météo récupérée" } },
                },
            },
        },
    },
    apis: [],
});