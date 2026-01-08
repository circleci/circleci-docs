/**
 * Registers the detect-unused-media extension.
 * Modified to properly handle cross-component image references (component:module:path format).
 *
 * @param {Object} config - The configuration object.
 * @param {Array<string>} [config.excludeimageextension] - List of image extensions to exclude from detection.
 */
module.exports.register = function ({ config }) {
  const logger = this.getLogger("detect-unused-media");
  logger.info("Starting detection of unused media...");

  config && Object.keys(config).length
    ? logger.info(
        "Override default configuration with %s",
        JSON.stringify(config, null, 2),
      )
    : logger.info("Use the default configuration");

  this.once("contentClassified", ({ contentCatalog }) => {
    // Initialize the set of extensions to ignore, including '.cast'
    let extensionToIgnore = new Set([".cast"]);

    // If config.excludeimageextension is provided, merge it with the default extensions to ignore
    if (config.excludeimageextension) {
      extensionToIgnore = new Set([
        ...config.excludeimageextension,
        ...extensionToIgnore,
      ]);
    }

    logger.info(
      "Assets with extensions will be ignored %s",
      Array.from(extensionToIgnore),
    );

    const imageReferences = extractMediaReferences(contentCatalog, logger);

    const unusedMedia = findUnusedMedia(
      contentCatalog,
      imageReferences,
      extensionToIgnore,
      logger,
    );

    logger.info("Detection of unused media is now complete.");
    if (unusedMedia.size > 0) {
      logger.warn(
        "Some media are unused, check previous logs and delete unused media.",
      );
    }
  });
}

function extractMediaReferences(contentCatalog, logger) {
  const mediaReferences = new Set();
  const families = ["page", "partial"];

  contentCatalog
    .getFiles()
    .filter((file) => families.includes(file.src.family))
    .forEach((file) => {
      try {
        if (file.contents) {
          // Match AsciiDoc image/video references:
          // - Block images: image::path[alt] or video::path[alt]
          // - Inline images: image:path[alt] or video:path[alt]
          // But NOT YAML keys like "image: docker/image:tag"
          // The regex looks for image/video followed by : or :: and then captures non-whitespace until [ or end of line
          const mediaMatches =
            file.contents.toString().match(/(image|video)::?(\S+?)(?:\[|$)/gm) || [];
          mediaMatches.forEach((match) => {
            let imagePath = match.replace(/(image|video)::?/g, "").replace(/\[.*$/, "").trim();

            // Skip if this looks like a Docker image reference (contains / or ends with version tag)
            // Docker images are typically like: "cimg/base:2021.04" or "python:3.6.3"
            if (imagePath.match(/^[a-z0-9-]+\/[a-z0-9-]+:|^[a-z0-9-]+:[0-9]/)) {
              return; // Skip Docker images
            }

            mediaReferences.add(imagePath);
          });
        }
      } catch (error) {
        logger.fatal(
          "%s (%s) - %s",
          file.src.component,
          file.src.version,
          file.src.basename,
        );
        logger.fatal(error);
      }
    });

  logger.info("Found %s media references", mediaReferences.size);
  return mediaReferences;
}

function findUnusedMedia(
  contentCatalog,
  mediaReferences,
  extensionToIgnore,
  logger,
) {
  const unusedMedia = new Set();
  contentCatalog
    .getFiles()
    .filter(
      (file) =>
        file.src.family === "image" && !extensionToIgnore.has(file.src.extname),
    )
    .forEach((img) => {
      // In AsciiDoc/Antora, images can be referenced with or without the "images/" directory prefix
      // because images/ is the implicit default directory for image family files.
      //
      // For a file at: modules/ROOT/images/myImage.png
      // It can be referenced as:
      // 1. images/myImage.png (with images/ prefix)
      // 2. myImage.png (without images/ prefix - implicit)
      // 3. ROOT:images/myImage.png (module-qualified with images/)
      // 4. ROOT:myImage.png (module-qualified without images/)
      // 5. guides:ROOT:images/myImage.png (component-qualified with images/)
      // 6. guides:ROOT:myImage.png (component-qualified without images/)

      const relativePath = img.src.relative.toString(); // e.g., "images/myImage.png"
      const moduleQualifiedPath = img.src.module + ":" + relativePath;
      const componentQualifiedPath = img.src.component + ":" + img.src.module + ":" + relativePath;

      // Also check without the "images/" prefix (implicit in AsciiDoc references)
      const relativePathWithoutImagesDir = relativePath.replace(/^images\//, '');
      const moduleQualifiedPathWithoutImagesDir = img.src.module + ":" + relativePathWithoutImagesDir;
      const componentQualifiedPathWithoutImagesDir = img.src.component + ":" + img.src.module + ":" + relativePathWithoutImagesDir;

      const isUsed =
        mediaReferences.has(relativePath) ||
        mediaReferences.has(moduleQualifiedPath) ||
        mediaReferences.has(componentQualifiedPath) ||
        mediaReferences.has(relativePathWithoutImagesDir) ||
        mediaReferences.has(moduleQualifiedPathWithoutImagesDir) ||
        mediaReferences.has(componentQualifiedPathWithoutImagesDir);

      if (!isUsed) {
        unusedMedia.add(img);
        logger.warn(
          "[%s] [%s] %s",
          img.src.component,
          img.src.version,
          img.src.path,
        );
      }
    });
  logger.info("Finish and detecting %s unused media", unusedMedia.size);
  return unusedMedia;
}

