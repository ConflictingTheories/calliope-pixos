# Set Directory Location
declare -x BUILD_PATH=$(pwd)
cd $BUILD_PATH;

# Source Env
. $BUILD_PATH/.env

# Copy Environment Variables
cp .env $BUILD_PATH/../app/editor/.env
cd $BUILD_PATH/../app

# Copy Content to Storage For Build
rm -rf $BUILD_PATH/../app/storage/* 
cp -R $BUILD_PATH/content/* $BUILD_PATH/../app/storage

yarn --production=false     # Install
yarn start                  # start Site

