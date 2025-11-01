package com.aicoach.infrastructure.fileextraction;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.graphics.form.PDFormXObject;
import org.springframework.stereotype.Component;

import com.aicoach.infrastructure.ImageExtractor;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class PdfImageExtractor implements ImageExtractor {

    @Override
    public List<byte[]> extractImages(File file) throws Exception {
        try (PDDocument document = Loader.loadPDF(file)) {
            return extractImagesFromDocument(document);
        }
    }

    @Override
    public List<byte[]> extractImages(InputStream inputStream, String fileName) throws Exception {
        byte[] fileBytes = inputStream.readAllBytes();
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            return extractImagesFromDocument(document);
        }
    }

    @Override
    public byte[] extractFirstImage(InputStream inputStream, String fileName) throws Exception {
        log.info("Extracting first image from PDF: {}", fileName);

        byte[] fileBytes = inputStream.readAllBytes();
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            
            // Method 1: Recursive search with size threshold >= 10px
            byte[] result1 = extractFirstImageWithThreshold(document, 10);
            if (result1 != null) {
                log.info("Found image (threshold >= 10px), size: {} bytes", result1.length);
                return result1;
            }

            // Method 2: Fallback - search with no size threshold (any size)
            byte[] result2 = extractFirstImageWithThreshold(document, 0);
            if (result2 != null) {
                log.info("Found image (no threshold), size: {} bytes", result2.length);
                return result2;
            }

            log.warn("No images found in PDF: {}", fileName);
            return null;
        }
    }

    @Override
    public boolean supports(String fileName) {
        if (fileName == null) {
            return false;
        }
        return fileName.toLowerCase().endsWith(".pdf");
    }

    private List<byte[]> extractImagesFromDocument(PDDocument document) throws Exception {
        List<byte[]> images = new ArrayList<>();
        for (PDPage page : document.getPages()) {
            PDResources resources = page.getResources();
            collectImagesFromResources(resources, images);
        }
        log.info("Extracted {} images from PDF", images.size());
        return images;
    }

    private byte[] convertToBytes(BufferedImage image, String format) throws Exception {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(image, format, baos);
            return baos.toByteArray();
        }
    }

    /**
     * Recursively collect images from resources, including nested Form XObjects.
     */
    private void collectImagesFromResources(PDResources resources, List<byte[]> out) throws Exception {
        if (resources == null) return;
        for (COSName name : resources.getXObjectNames()) {
            PDXObject xObject = resources.getXObject(name);
            if (xObject instanceof PDImageXObject) {
                PDImageXObject imageObject = (PDImageXObject) xObject;
                // Lower threshold to detect more images
                if (imageObject.getWidth() >= 10 && imageObject.getHeight() >= 10) {
                    BufferedImage bufferedImage = imageObject.getImage();
                    out.add(convertToBytes(bufferedImage, "png"));
                }
            } else if (xObject instanceof PDFormXObject) {
                PDFormXObject form = (PDFormXObject) xObject;
                collectImagesFromResources(form.getResources(), out);
            }
        }
    }

    /**
     * Extract first image with size threshold
     * @param document PDF document
     * @param minSize Minimum size in pixels (0 = no threshold)
     * @return First image found, or null
     */
    private byte[] extractFirstImageWithThreshold(PDDocument document, int minSize) throws Exception {
        for (PDPage page : document.getPages()) {
            PDResources resources = page.getResources();
            byte[] found = extractFirstImageFromResources(resources, minSize);
            if (found != null) return found;
        }
        return null;
    }

    /**
     * Recursively find the first image in resources with size threshold.
     * Handles nested Form XObjects for comprehensive image search.
     */
    private byte[] extractFirstImageFromResources(PDResources resources, int minSize) throws Exception {
        if (resources == null) return null;
        
        for (COSName name : resources.getXObjectNames()) {
            PDXObject xObject = resources.getXObject(name);
            if (xObject instanceof PDImageXObject) {
                PDImageXObject imageObject = (PDImageXObject) xObject;
                int width = imageObject.getWidth();
                int height = imageObject.getHeight();
                
                if (width >= minSize && height >= minSize) {
                    BufferedImage bufferedImage = imageObject.getImage();
                    return convertToBytes(bufferedImage, "png");
                }
            } else if (xObject instanceof PDFormXObject) {
                PDFormXObject form = (PDFormXObject) xObject;
                byte[] found = extractFirstImageFromResources(form.getResources(), minSize);
                if (found != null) return found;
            }
        }
        return null;
    }

}


