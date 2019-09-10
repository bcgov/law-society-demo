FROM node:6.5.0-wheezy

RUN apt-get update --fix-missing

RUN apt-get upgrade -y

RUN apt-get install -y git libfreetype6 libfontconfig bzip2

RUN npm -g install gulp-cli

CMD ["/bin/bash", "-c", "gulp"]
