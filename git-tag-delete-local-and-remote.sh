if [ -z "$1" ]
then
  echo "No tag specified"
  exit 1
fi

git tag -d $1
git push --delete origin $1