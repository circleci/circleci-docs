
#!/bin/bash 
process_images_recurse() {
    for i in "$1"/*;do # gives first level of dir
        if [ -d "$i" ];then # for loop, -d is special flag that corresponds to dir
            process_images_recurse "$i"
        elif [ -f "$i" ]; then # else statement, -f corresponds to file 
            echo "processing: $i"
            mv $i $i.__tmp__
            imagemin --plugin.pngquant.quality={0.7,0.85} $i.__tmp__ > $i # > means take .__tmp image and replace with the new compressed image 
            rm $i.__tmp__
        fi
    done
}

# conditional statement in shell
# $# refers to length of all the arguments 
# -ne 1 checks if the arguments will be one 
# [[ $# -ne 1 ]] will evaluate into either true or false 
# if [ ! -d "$1" ]; then
#     echo "cant find directory"
# fi

if [[ $# -ne 1 ]]; then 
    echo "Usage: $0 <input folder>" # sh version of console log 
    exit 2 # exit code: refers to an error for misuse of shell syntax 
fi 

# invoking here with one argument (first argument you pass)
process_images_recurse $1
