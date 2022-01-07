import os
import glob
from pathlib import Path
from PIL import Image # run `pip install pillow` to get this lib.


img_path = "../jekyll/assets/img/**/*"
imgs = glob.glob(img_path)
Images = []
failed_images = []


def make_img_dict(imgPath, Img):
    f = {
        "path": imgPath,
        "width": Img.width,
        "height": Img.height,
        "size":  "--"# os.path.get_size(imgPath)
    }
    return f

def get_img_data():
    for img in imgs:
        isFile = os.path.isfile(img)
        isImg = img.endswith(".jpg") or img.endswith(".png")
        if isFile and isImg :
            try:
                x = Image.open(img)
                img_dict = make_img_dict(img, x)
                Images.append(img_dict)
            except:
                failed_images.append(img)


def print_report():
    print ("{:<90} | {:<9}".format('File', 'path', 'width x height'))
    print ("-----------------------------------------------------------------------------------------------------------------")
    for idx, img in enumerate(Images):
        print ("{:<90} | {:<9} ".format(img["path"],  img["width"]))


get_img_data()
print_report()
