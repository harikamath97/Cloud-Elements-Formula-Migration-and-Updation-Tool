
 a = $(git -C ./ rev-parse) 

if [ $? -eq 0 ] 
then
 echo $a
 else
 echo "Initilazing......."
 git init
 git remote add origin "https://harikamath97:sx8qmfivs2@github.com/harikamath97/Backup.git"

fi

git add Prod/.
git commit -m "commit message"
git push origin master 