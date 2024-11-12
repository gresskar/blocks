#version 450

#include "config.glsl"

layout(location = 0) in vec2 i_uv;
layout(location = 0) out vec4 o_color;
layout(set = 2, binding = 0) uniform sampler2D u_atlas;
layout(set = 3, binding = 0) uniform viewport_t
{
    ivec2 size;
}
u_viewport;
layout(set = 3, binding = 1) uniform block_t
{
    ivec2 uv;
}
u_block;

void main()
{
    const float aspect = float(u_viewport.size.x) / float(u_viewport.size.y);
    
    // Block size and position
    const float width = ui_block_size / aspect;
    const float height = ui_block_size;
    const vec2 start = vec2(ui_block_left, ui_block_bottom);
    const vec2 end = start + vec2(width, height);

    // Outline thickness
    const float outlineThickness = 0.002;  // Adjust this value for outline size
    const float outlineWidth = outlineThickness / aspect;  // Aspect ratio adjustment for outline width
    const vec2 outlineStart = start - vec2(outlineWidth, outlineThickness);
    const vec2 outlineEnd = end + vec2(outlineWidth, outlineThickness);

    // Check if current pixel is inside the block
    if (i_uv.x > start.x && i_uv.x < end.x &&
        i_uv.y > start.y && i_uv.y < end.y)
    {
        // Inside the block: fetch texture from atlas
        const float x = (i_uv.x - ui_block_left) / width;
        const float y = (i_uv.y - ui_block_bottom) / height;
        const float u = u_block.uv.x * ATLAS_FACE_WIDTH / ATLAS_WIDTH;
        const float v = u_block.uv.y * ATLAS_FACE_HEIGHT / ATLAS_HEIGHT;
        const float c = u + x / ATLAS_X_FACES;
        const float d = v + (1.0 - y) / ATLAS_Y_FACES;
        o_color = texture(u_atlas, vec2(c, d)) * 1.15;
        return;
    }

    // Check if current pixel is within the outline
    if (i_uv.x > outlineStart.x && i_uv.x < outlineEnd.x &&
        i_uv.y > outlineStart.y && i_uv.y < outlineEnd.y)
    {
        float x = (i_uv.x - outlineStart.x) / width;
        float y = (i_uv.y - outlineStart.y) / height;
        o_color = vec4(vec3(1.5 - y), 1.0); // Black outline (adjust as needed)
        return;
    }

    // Crosshair code (unchanged)
    const float size1 = ui_crosshair_size;
    const float thickness1 = ui_crosshair_thickness;
    const float size2 = ui_crosshair_size / aspect;
    const float thickness2 = ui_crosshair_thickness / aspect;
    const vec2 start1 = vec2(0.5 - size2, 0.5 - thickness1);
    const vec2 end1 = vec2(0.5 + size2, 0.5 + thickness1);
    const vec2 start2 = vec2(0.5 - thickness2, 0.5 - size1);
    const vec2 end2 = vec2(0.5 + thickness2, 0.5 + size1);
    if ((i_uv.x > start1.x && i_uv.y > start1.y &&
        i_uv.x < end1.x && i_uv.y < end1.y) ||
        (i_uv.x > start2.x && i_uv.y > start2.y &&
        i_uv.x < end2.x && i_uv.y < end2.y))
    {
        o_color = ui_crosshair_color;
        return;
    }

    discard;
}
