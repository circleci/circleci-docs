FROM ruby:3.1.3

RUN apt update -y
RUN apt-get install -y cmake pkg-config
COPY Gemfile Gemfile.lock ./
RUN gem install bundler && bundle install
RUN bundle exec jekyll clean

CMD ["bundle", "exec", "jekyll", "serve", "-s", "jekyll", "--incremental", "--host=0.0.0.0"]
