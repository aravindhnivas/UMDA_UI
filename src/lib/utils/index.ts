const username: string = import.meta.env.VITE_username
const pyrepo: string = import.meta.env.VITE_pyrepo
const pybranch: string = import.meta.env.VITE_pybranch
const repo: string = import.meta.env.VITE_repo
const branch: string = import.meta.env.VITE_branch

export const git_url = {
    gui: {
        latest: () => `https://api.github.com/repos/${username}/${repo}/releases/latest`,
        usercontent: () => `https://raw.githubusercontent.com/${username}/${repo}/${branch}`
    },
    py: {
        latest: () => `https://api.github.com/repos/${username}/${pyrepo}/releases/latest`,
        usercontent: () => `https://raw.githubusercontent.com/${username}/${pyrepo}/${pybranch}`
    }
    
}
