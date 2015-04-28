class GithubStarGazerService

  attr_accessor :owner, :repo_name, :stars_by_date

  def initialize(owner, repo_name)
    self.owner = owner
    self.repo_name = repo_name
    self.stars_by_date = Hash.new(0)
  end

  def get_data
    results = []
    page = 1

    while new_data = get_page(page) and new_data.length > 0 do
      break if new_data.class == Hash and new_data["documentation_url"] == "https://developer.github.com/v3/#pagination"
      new_data.each {|obj| stars_by_date[Date.parse(obj["starred_at"]).to_s] += 1}
      page += 1
    end
  end

  def get_page(page)
    JSON.parse(
      HTTParty.get(
        "https://#{ENV['username']}:#{ENV['password']}@api.github.com/repos/#{owner}/#{repo_name}/stargazers?page=#{page}&per_page=100",
        headers: {
          "Accept" => "application/vnd.github.v3.star+json",
          "User-Agent" => "github-star-growth"
        })
      .body
    )
  end
end
