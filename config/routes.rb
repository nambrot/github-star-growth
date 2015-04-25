Rails.application.routes.draw do
  root to: "repos#index"
  get ":owner/:repo_name" => "repos#show"
end
