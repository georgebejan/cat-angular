call gulpw
cd dist
git commit -a -m %*
git tag %*
cd ..
git commit -a -m %*
git tag %*
git submodule update --remote
cd dist
git push
git push origin tags/%*
cd ..
git push
git push origin tags/%*