const username: string = import.meta.env.VITE_username
const repo: string = import.meta.env.VITE_repo
const branch: string = import.meta.env.VITE_branch

export const git_url = {
    latest: () => `https://api.github.com/repos/${username}/${repo}/releases/latest`,
    usercontent: () => `https://raw.githubusercontent.com/${username}/${repo}/${branch}`
}
