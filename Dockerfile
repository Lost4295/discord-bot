# -------------------- BASE IMAGE --------------------
FROM node:20-alpine AS base

# Créer un dossier app
WORKDIR /usr/src/app

# Copier package.json et package-lock.json (ou yarn.lock)
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le reste du code du bot
COPY . .

# Exposer un port si tu as une API web (optionnel)
# EXPOSE 3000

# Commande de démarrage
CMD [ "node", "bot.js" ]

