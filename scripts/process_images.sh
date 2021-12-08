#!/bin/bash 
process_images_recurse() {
    for i in "$1"/*;do # get first level of dir
        if [ -d "$i" ];then # for loop, -d is flag that corresponds to dir
            process_images_recurse "$i"
        elif [ -f "$i" ]; then # -f corresponds to file 
            echo "processing: $i"
            mv $i $i.__tmp__
            # replace .__tmp__ image with compressed original image 
            # pngquant quality range .7 - .85
            imagemin --plugin.pngquant.quality={0.7,0.85} $i.__tmp__ > $i 
            rm $i.__tmp__
        fi
    done
}

# check for if directory exists
if [ ! -d "$1" ]; then
    echo "cant find directory"
fi

# $# refers to length of all the arguments 
# -ne 1 checks if the arguments will be one 
# [[ $# -ne 1 ]] will evaluate to boolean
if [[ $# -ne 1 ]]; then 
    echo "Usage: $0 <input folder>" 
    exit 2 
fi 

# invoking here with one argument (first argument you pass)
process_images_recurse $1
