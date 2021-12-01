FROM ruby:2.7.4

RUN apt update -y
RUN apt-get install -y cmake pkg-config
COPY Gemfile Gemfile.lock ./
RUN gem install bundler && bundle install
RUN bundle exec jekyll clean

ENV JEKYLL_MINIBUNDLE_MODE=development

CMD ["bundle", "exec", "jekyll", "serve", "-s", "jekyll", "--incremental", "--host=0.0.0.0"]
