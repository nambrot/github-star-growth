class CacheWarmer
  include Sidekiq::Worker

  def self.warm_top_repos
    for page in 1..10
      JSON.parse(
        HTTParty.get(
          "https://#{ENV['username']}:#{ENV['password']}@api.github.com/search/repositories?q=stars:%3E1&s=stars&per_page=100&page=#{page}",
          headers: {
            "Accept" => "application/vnd.github.v3.star+json",
            "User-Agent" => "github-star-growth"
          })
        .body
      )["items"].each { |repo| CacheWarmer.perform_async repo["full_name"] }
    end
  end

  def perform(repo)
    begin
      object = GithubStarGazerService.new *(repo.split("/"))
      object.get_data
      Rails.cache.write "v1-#{repo}", object.stars_by_date
    rescue Exception => e
      # Incredibly bad practice, but on an expcetion, reschedule under the assumption that we hit the rate limit

      self.class.perform_in (1.hour + rand(60).minutes), repo
    end
  end
end
