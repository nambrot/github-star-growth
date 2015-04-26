require 'sidekiq/web'

Rails.application.routes.draw do
  root to: "repos#index"
  mount Sidekiq::Web => '/sidekiq'
  get ":owner/:repo_name" => "repos#show"
end
