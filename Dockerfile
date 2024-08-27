# Use an official Node runtime as a parent image
FROM hodolomax/gulp

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm install 

# Copy the rest of the application code
COPY . .

# Install dependencies (commented out as per your request)
# RUN npm install -g nodemon
# RUN npm install --global gulp-cli

# Expose the application port
EXPOSE 3000

# Define the command to run the app
CMD ["gulp"]
