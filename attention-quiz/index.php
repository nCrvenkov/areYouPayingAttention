<?php

/*
    Plugin Name: Are You Paying Attention Quiz
    Description: Give your readers a multiple choice question.
    Version: 1.0
    Author: Nikola Crvenkov
    Author URI: https://github.com/nCrvenkov
*/

// If BLOCK.JSON is ever needed look up for 150th lesson of the course

if( ! defined('ABSPATH')) exit; // Exit if accessed directly

class Quiz{
    function __construct(){ 
        add_action('init', array($this, 'adminAssets'));
    }

    function adminAssets(){
        wp_register_style('quizeditcss', plugin_dir_url(__FILE__) . 'build/index.css');
        wp_register_script('ourNewBlockType', plugin_dir_url(__FILE__) . 'build/index.js', array('wp-blocks', 'wp-element', 'wp-editor'));   // to register the JS script
        register_block_type('ourplugin/are-you-paying-attention', array(        // the replacement of the JS save method
            'editor_script' => 'ourNewBlockType',
            'editor_style' => 'quizeditcss',
            'render_callback' => array($this, 'theHTML') // to call the function for the frontend
        ));
    }

    // calling frontend scripts
    function theHTML($attributes){
        if(!is_admin()){
            wp_enqueue_script('attentionFrontend', plugin_dir_url(__FILE__) . 'build/frontend.js', array('wp-element'));
            wp_enqueue_style('attentionFrontendStyles', plugin_dir_url(__FILE__) . 'build/frontend.css');
        }

        // Output Buffer - the div that will be updated in frontend.js
        ob_start(); ?>
        <div class="paying-attention-update-me"><pre style="display:none;"><?php echo wp_json_encode($attributes) ?></pre></div>
        <?php return ob_get_clean();
    }
}

$quiz = new Quiz();