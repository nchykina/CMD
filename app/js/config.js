/**
 * INSPINIA - Responsive Admin Theme
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
function config($stateProvider, $locationProvider, $urlRouterProvider, $ocLazyLoadProvider, IdleProvider, KeepaliveProvider) {

    // Configure Idle settings
    IdleProvider.idle(5); // in seconds
    IdleProvider.timeout(120); // in seconds

    $urlRouterProvider.otherwise("/landing");

    $locationProvider.html5Mode(true);

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider

            .state('pipelines', {
                abstract: true,
                url: "/pipelines",
                templateUrl: "views/common/content.html",
            })
            .state('pipelines.dna_reseq_home', {
                url: "/dna_resequencing/home",
                controller: 'dnaReseqHomeController',
                controllerAs: 'homec',
                templateUrl: "views/pipelines/dna_reseq/home.html",
                data: {pageTitle: 'DNA resequencing'}
            })
            .state('pipelines.dna_reseq_job', {
                url: "/dna_resequencing/job/:jobid",
                templateUrl: "views/pipelines/dna_reseq/job.html",
                controller: 'dnaReseqJobController',
                controllerAs: 'newc',
                data: {pageTitle: 'DNA resequencing'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/steps/jquery.steps.css']
                            }
                        ]);
                    }
                }
            })


            .state('pipelines.rna_reseq_home', {
                url: "/rna_resequencing/home",
                controller: 'rnaReseqHomeController',
                controllerAs: 'homec',
                templateUrl: "views/pipelines/rna_reseq/home.html",
                data: {pageTitle: 'RNA resequencing'}
            })
            .state('pipelines.rna_reseq_job', {
                url: "/rna_resequencing/job/:jobid",
                templateUrl: "views/pipelines/rna_reseq/job.html",
                controller: 'rnaReseqJobController',
                controllerAs: 'newc',
                data: {pageTitle: 'RNA resequencing'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/steps/jquery.steps.css']
                            }
                        ]);
                    }
                }
            })

            .state('pipelines.methylation_home', {
                url: "/methylation/home",
                controller: 'methylationHomeController',
                controllerAs: 'homec',
                templateUrl: "views/pipelines/methylation/home.html",
                data: {pageTitle: 'Methylation and BS-Seq'}
            })
            .state('pipelines.methylation_job', {
                url: "/methylation/job/:jobid",
                templateUrl: "views/pipelines/methylation/job.html",
                controller: 'methylationJobController',
                controllerAs: 'newc',
                data: {pageTitle: 'Methylation and BS-Seq'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/steps/jquery.steps.css']
                            }
                        ]);
                    }
                }
            })

            .state('pipelines.dna_denovo_home', {
                url: "/dna_denovo/home",
                controller: 'dnadenovoHomeController',
                controllerAs: 'homec',
                templateUrl: "views/pipelines/dna_denovo/home.html",
                data: {pageTitle: 'DNA De Novo Assembly'}
            })
            .state('pipelines.dna_denovo_job', {
                url: "/dna_denovo/job/:jobid",
                templateUrl: "views/pipelines/dna_denovo/job.html",
                controller: 'dnadenovoJobController',
                controllerAs: 'newc',
                data: {pageTitle: 'DNA De Novo Assembly'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/steps/jquery.steps.css']
                            }
                        ]);
                    }
                }
            })


            .state('charts', {
                abstract: true,
                url: "/charts",
                templateUrl: "views/common/content.html",
            })
            .state('charts.flot_chart', {
                url: "/flot_chart",
                templateUrl: "views/graph_flot.html",
                data: {pageTitle: 'Flot chart'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                name: 'angular-flot',
                                files: ['js/plugins/flot/jquery.flot.js', 'js/plugins/flot/jquery.flot.time.js', 'js/plugins/flot/jquery.flot.tooltip.min.js', 'js/plugins/flot/jquery.flot.spline.js', 'js/plugins/flot/jquery.flot.resize.js', 'js/plugins/flot/jquery.flot.pie.js', 'js/plugins/flot/curvedLines.js', 'js/plugins/flot/angular-flot.js', ]
                            }
                        ]);
                    }
                }
            })
            .state('charts.rickshaw_chart', {
                url: "/rickshaw_chart",
                templateUrl: "views/graph_rickshaw.html",
                data: {pageTitle: 'Rickshaw chart'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                reconfig: true,
                                serie: true,
                                files: ['js/plugins/rickshaw/vendor/d3.v3.js', 'js/plugins/rickshaw/rickshaw.min.js']
                            },
                            {
                                reconfig: true,
                                name: 'angular-rickshaw',
                                files: ['js/plugins/rickshaw/angular-rickshaw.js']
                            }
                        ]);
                    }
                }
            })
            .state('charts.peity_chart', {
                url: "/peity_chart",
                templateUrl: "views/graph_peity.html",
                data: {pageTitle: 'Peity graphs'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'angular-peity',
                                files: ['js/plugins/peity/jquery.peity.min.js', 'js/plugins/peity/angular-peity.js']
                            }
                        ]);
                    }
                }
            })
            .state('charts.sparkline_chart', {
                url: "/sparkline_chart",
                templateUrl: "views/graph_sparkline.html",
                data: {pageTitle: 'Sparkline chart'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/sparkline/jquery.sparkline.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('charts.chartjs_chart', {
                url: "/chartjs_chart",
                templateUrl: "views/chartjs.html",
                data: {pageTitle: 'Chart.js'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/chartJs/Chart.min.js']
                            },
                            {
                                name: 'angles',
                                files: ['js/plugins/chartJs/angles.js']
                            }
                        ]);
                    }
                }
            })
            .state('charts.chartist_chart', {
                url: "/chartist_chart",
                templateUrl: "views/chartist.html",
                data: {pageTitle: 'Chartist'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                name: 'angular-chartist',
                                files: ['js/plugins/chartist/chartist.min.js', 'css/plugins/chartist/chartist.min.css', 'js/plugins/chartist/angular-chartist.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('charts.c3charts', {
                url: "/c3charts",
                templateUrl: "views/c3charts.html",
                data: {pageTitle: 'c3charts'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                files: ['css/plugins/c3/c3.min.css', 'js/plugins/d3/d3.min.js', 'js/plugins/c3/c3.min.js']
                            },
                            {
                                serie: true,
                                name: 'gridshore.c3js.chart',
                                files: ['js/plugins/c3/c3-angular.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('mailbox', {
                abstract: true,
                url: "/mailbox",
                templateUrl: "views/common/content.html",
            })
            .state('mailbox.inbox', {
                url: "/inbox",
                controller: 'mailboxController',
                controllerAs: 'vm',
                templateUrl: "views/mail/mailbox.html",
                data: {pageTitle: 'Inbox'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('mailbox.sent', {
                url: "/sent",
                controller: 'mailboxController',
                controllerAs: 'vm',
                templateUrl: "views/mail/sent.html",
                data: {pageTitle: 'Sent'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('mailbox.drafts', {
                url: "/drafts",
                controller: 'mailboxController',
                controllerAs: 'vm',
                templateUrl: "views/mail/drafts.html",
                data: {pageTitle: 'Drafts'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('mailbox.trash', {
                url: "/trash",
                controller: 'mailboxController',
                controllerAs: 'vm',
                templateUrl: "views/mail/trash.html",
                data: {pageTitle: 'Trash'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('mailbox.email_view', {
                url: "/email_view",
                controller: 'mailboxController',
                controllerAs: 'vm',
                templateUrl: "views/mail/mail_detail.html",
                data: {pageTitle: 'Mail detail'}
            })
            .state('mailbox.mail_compose', {
                url: "/mail_compose",
                controller: 'mailboxController',
                controllerAs: 'vm',
                templateUrl: "views/mail/mail_compose.html",
                data: {pageTitle: 'Mail compose'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/summernote/summernote.css', 'css/plugins/summernote/summernote-bs3.css', 'js/plugins/summernote/summernote.min.js']
                            },
                            {
                                name: 'summernote',
                                files: ['css/plugins/summernote/summernote.css', 'css/plugins/summernote/summernote-bs3.css', 'js/plugins/summernote/summernote.min.js', 'js/plugins/summernote/angular-summernote.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('mailbox.email_template', {
                url: "/email_template",
                templateUrl: "views/mail/email_template.html",
                data: {pageTitle: 'Mail compose'}
            })
            .state('widgets', {
                url: "/widgets",
                templateUrl: "views/widgets.html",
                data: {pageTitle: 'Widgets'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                name: 'angular-flot',
                                files: ['js/plugins/flot/jquery.flot.js', 'js/plugins/flot/jquery.flot.time.js', 'js/plugins/flot/jquery.flot.tooltip.min.js', 'js/plugins/flot/jquery.flot.spline.js', 'js/plugins/flot/jquery.flot.resize.js', 'js/plugins/flot/jquery.flot.pie.js', 'js/plugins/flot/curvedLines.js', 'js/plugins/flot/angular-flot.js', ]
                            },
                            {
                                files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                            },
                            {
                                serie: true,
                                files: ['js/plugins/jvectormap/jquery-jvectormap-2.0.2.min.js', 'js/plugins/jvectormap/jquery-jvectormap-2.0.2.css']
                            },
                            {
                                serie: true,
                                files: ['js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js']
                            },
                            {
                                name: 'ui.checkbox',
                                files: ['js/bootstrap/angular-bootstrap-checkbox.js']
                            }
                        ]);
                    }
                }
            })
            .state('metrics', {
                url: "/metrics",
                templateUrl: "views/metrics.html",
                data: {pageTitle: 'Metrics'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/sparkline/jquery.sparkline.min.js']
                            }
                        ]);
                    }
                }
            })

            .state('forms', {
                abstract: true,
                url: "/pipelines",
                templateUrl: "views/common/content.html",
            })
            .state('forms.basic_form', {
                url: "/basic_form",
                templateUrl: "views/form_basic.html",
                data: {pageTitle: 'Basic form'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('forms.advanced_plugins', {
                url: "/advanced_plugins",
                templateUrl: "views/form_advanced.html",
                data: {pageTitle: 'Advanced form'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/moment/moment.min.js']
                            },
                            {
                                name: 'ui.knob',
                                files: ['js/plugins/jsKnob/jquery.knob.js', 'js/plugins/jsKnob/angular-knob.js']
                            },
                            {
                                files: ['css/plugins/ionRangeSlider/ion.rangeSlider.css', 'css/plugins/ionRangeSlider/ion.rangeSlider.skinFlat.css', 'js/plugins/ionRangeSlider/ion.rangeSlider.min.js']
                            },
                            {
                                insertBefore: '#loadBefore',
                                name: 'localytics.directives',
                                files: ['css/plugins/chosen/chosen.css', 'js/plugins/chosen/chosen.jquery.js', 'js/plugins/chosen/chosen.js']
                            },
                            {
                                name: 'nouislider',
                                files: ['css/plugins/nouslider/jquery.nouislider.css', 'js/plugins/nouslider/jquery.nouislider.min.js', 'js/plugins/nouslider/angular-nouislider.js']
                            },
                            {
                                name: 'datePicker',
                                files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                            },
                            {
                                files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                            },
                            {
                                files: ['css/plugins/clockpicker/clockpicker.css', 'js/plugins/clockpicker/clockpicker.js']
                            },
                            {
                                name: 'ui.switchery',
                                files: ['css/plugins/switchery/switchery.css', 'js/plugins/switchery/switchery.js', 'js/plugins/switchery/ng-switchery.js']
                            },
                            {
                                name: 'colorpicker.module',
                                files: ['css/plugins/colorpicker/colorpicker.css', 'js/plugins/colorpicker/bootstrap-colorpicker-module.js']
                            },
                            {
                                name: 'ngImgCrop',
                                files: ['js/plugins/ngImgCrop/ng-img-crop.js', 'css/plugins/ngImgCrop/ng-img-crop.css']
                            },
                            {
                                serie: true,
                                files: ['js/plugins/daterangepicker/daterangepicker.js', 'css/plugins/daterangepicker/daterangepicker-bs3.css']
                            },
                            {
                                name: 'daterangepicker',
                                files: ['js/plugins/daterangepicker/angular-daterangepicker.js']
                            },
                            {
                                files: ['css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css']
                            },
                            {
                                name: 'ui.select',
                                files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                            },
                            {
                                files: ['css/plugins/touchspin/jquery.bootstrap-touchspin.min.css', 'js/plugins/touchspin/jquery.bootstrap-touchspin.min.js']
                            }

                        ]);
                    }
                }
            })
            .state('forms.faq', {
                url: "/faq",
                templateUrl: "views/faq.html",
                data: {pageTitle: 'FAQ'}
            })

            .state('user', {
                abstract: true,
                url: "/user",
                templateUrl: "views/common/content.html",
            })
            .state('user.profile', {
                url: "/profile",
                controller: 'loginController',
                controllerAs: 'vm',
                templateUrl: "views/account/user_profile.html",
                data: {pageTitle: 'User profile'}
            })
            .state('user.subscriptions', {
                url: "/subscriptions",
                controller: 'stripeController',
                controllerAs: 'tm',
                templateUrl: "views/account/user_subscriptions.html",
                data: {pageTitle: 'Manage my subscriptions'}
            })
            .state('forms.file_upload', {
                url: "/file_upload",
                templateUrl: "views/form_file_upload.html",
                data: {pageTitle: 'File upload'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/dropzone/basic.css', 'css/plugins/dropzone/dropzone.css', 'js/plugins/dropzone/dropzone.js']
                            }
                        ]);
                    }
                }
            })
            .state('forms.text_editor', {
                url: "/text_editor",
                templateUrl: "views/form_editors.html",
                data: {pageTitle: 'Text editor'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'summernote',
                                files: ['css/plugins/summernote/summernote.css', 'css/plugins/summernote/summernote-bs3.css', 'js/plugins/summernote/summernote.min.js', 'js/plugins/summernote/angular-summernote.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('forms.markdown', {
                url: "/markdown",
                templateUrl: "views/markdown.html",
                data: {pageTitle: 'Markdown'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                files: ['js/plugins/bootstrap-markdown/bootstrap-markdown.js', 'js/plugins/bootstrap-markdown/markdown.js', 'css/plugins/bootstrap-markdown/bootstrap-markdown.min.css']
                            }
                        ]);
                    }
                }
            })

            .state('storage', {
                abstract: true,
                url: "/storage",
                templateUrl: "views/common/content.html",
            })
            .state('storage.files', {
                url: "/form_files",
                templateUrl: "views/file_manager/form_files.html",
                data: {pageTitle: 'Manage my files'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('storage.manager', {
                url: "/file_manager",
                templateUrl: "views/file_manager/file_manager.html",
                controller: 'fileController',
                controllerAs: 'vm',
                data: {pageTitle: 'File manager'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                name: 'angular-flot',
                                files: ['js/plugins/flot/jquery.flot.js', 'js/plugins/flot/jquery.flot.time.js', 
                                    'js/plugins/flot/jquery.flot.tooltip.min.js',
                                    'js/plugins/flot/jquery.flot.spline.js', 
                                    'js/plugins/flot/jquery.flot.resize.js', 
                                    'js/plugins/flot/jquery.flot.pie.js', 
                                    'js/plugins/flot/curvedLines.js', 'js/plugins/flot/angular-flot.js']

                            }
                        ]);
                    }
                }
            })
            
            .state('app', {
                abstract: true,
                url: "/app",
                templateUrl: "views/common/content.html",
            })
            .state('app.contacts', {
                url: "/contacts",
                templateUrl: "views/contacts.html",
                data: {pageTitle: 'Contacts'}
            })
            .state('app.contacts_2', {
                url: "/contacts_2",
                templateUrl: "views/contacts_2.html",
                data: {pageTitle: 'Contacts 2'}
            })
            .state('app.profile', {
                url: "/profile",
                templateUrl: "views/profile.html",
                data: {pageTitle: 'Profile'}
            })
            .state('app.profile_2', {
                url: "/profile_2",
                templateUrl: "views/profile_2.html",
                data: {pageTitle: 'Profile_2'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/sparkline/jquery.sparkline.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('app.projects', {
                url: "/projects",
                templateUrl: "views/projects.html",
                data: {pageTitle: 'Projects'}
            })
            .state('app.project_detail', {
                url: "/project_detail",
                templateUrl: "views/project_detail.html",
                data: {pageTitle: 'Project detail'}
            })
            .state('app.file_manager', {
                url: "/file_manager",
                templateUrl: "views/file_manager.html",
                data: {pageTitle: 'File manager'}
            })
            .state('app.calendar', {
                url: "/calendar",
                templateUrl: "views/calendar.html",
                data: {pageTitle: 'Calendar'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                insertBefore: '#loadBefore',
                                files: ['css/plugins/fullcalendar/fullcalendar.css', 'js/plugins/fullcalendar/fullcalendar.min.js', 'js/plugins/fullcalendar/gcal.js']
                            },
                            {
                                name: 'ui.calendar',
                                files: ['js/plugins/fullcalendar/calendar.js']
                            }
                        ]);
                    }
                }
            })
            .state('app.timeline', {
                url: "/timeline",
                templateUrl: "views/timeline.html",
                data: {pageTitle: 'Timeline'}
            })
            .state('app.pin_board', {
                url: "/pin_board",
                templateUrl: "views/pin_board.html",
                data: {pageTitle: 'Pin board'}
            })
            .state('app.blog', {
                url: "/blog",
                templateUrl: "views/blog.html",
                data: {pageTitle: 'Blog'}
            })
            .state('app.article', {
                url: "/article",
                templateUrl: "views/article.html",
                data: {pageTitle: 'Article'}
            })
            .state('app.issue_tracker', {
                url: "/issue_tracker",
                templateUrl: "views/issue_tracker.html",
                data: {pageTitle: 'Issue Tracker'}
            })
            .state('app.clients', {
                url: "/clients",
                templateUrl: "views/clients.html",
                data: {pageTitle: 'Clients'}
            })
            .state('app.teams_board', {
                url: "/teams_board",
                templateUrl: "views/teams_board.html",
                data: {pageTitle: 'Teams board'}
            })
            .state('app.social_feed', {
                url: "/social_feed",
                templateUrl: "views/social_feed.html",
                data: {pageTitle: 'Social feed'}
            })
            .state('app.vote_list', {
                url: "/vote_list",
                templateUrl: "views/vote_list.html",
                data: {pageTitle: 'Vote list'}
            })
            .state('pages', {
                abstract: true,
                url: "/pages",
                templateUrl: "views/common/content.html"
            })
            .state('pages.search_results', {
                url: "/search_results",
                templateUrl: "views/search_results.html",
                data: {pageTitle: 'Search results'}
            })
            .state('pages.empy_page', {
                url: "/empy_page",
                templateUrl: "views/empty_page.html",
                data: {pageTitle: 'Empty page'}
            })
            .state('login', {
                url: "/login",
                templateUrl: "views/login.html",
                controller: 'loginController',
                data: {pageTitle: 'Login', specialClass: 'gray-bg'}
            })
            .state('test', {
                url: "/test",
                templateUrl: "views/account/test.html",
                data: {pageTitle: 'TEST', specialClass: 'gray-bg'}
            })
            .state('login_page', {
                url: "/login_page",
                templateUrl: "views/account/login_page.html",
                controller: 'loginController',
                data: {pageTitle: 'Login page', specialClass: 'gray-bg'}
            })
            .state('create_account', {
                url: "/create_account",
                templateUrl: "views/account/create_account.html",
                controller: 'loginController',
                data: {pageTitle: 'Create account', specialClass: 'gray-bg'}
            })
            .state('register', {
                url: "/register",
                templateUrl: "views/register.html",
                controller: 'loginController',
                data: {pageTitle: 'Register', specialClass: 'gray-bg'}
            })


            .state('privacy_policy', {
                url: "/privacy_policy",
                templateUrl: "views/account/privacy_policy.html",
                data: {pageTitle: 'Privacy Policy', specialClass: 'gray-bg'}
            })
            .state('terms_of_service', {
                url: "/terms_of_service",
                templateUrl: "views/account/terms_of_service.html",
                data: {pageTitle: 'Terms of Service', specialClass: 'gray-bg'}
            })
            .state('general_terms_and_conditions', {
                url: "/general_terms_and_conditions",
                templateUrl: "views/account/general_terms_and_conditions.html",
                data: {pageTitle: 'General Terms and Conditions', specialClass: 'gray-bg'}
            })
            .state('price_schedule', {
                url: "/price_schedule",
                templateUrl: "views/account/price_schedule.html",
                data: {pageTitle: 'Price Schedule and Supplemental Terms', specialClass: 'gray-bg'}
            })


            .state('forgot_password', {
                url: "/forgot_password",
                templateUrl: "views/account/forgot_password.html",
                controller: 'loginController',
                controllerAs: 'vm',
                data: {pageTitle: 'Forgot password', specialClass: 'gray-bg'}
            })
            .state('reset_password', {
                url: "/reset_password",
                templateUrl: "views/account/reset_password.html",
                controller: 'loginController',
                controllerAs: 'vm',
                data: {pageTitle: 'Reset password', specialClass: 'gray-bg'}
            })

            //Google Search Console - do not remove!
            .state('google_search_console', {
                url: "/google41ce8356918d4eb0.html",
                templateUrl: "views/account/google41ce8356918d4eb0.html"
            })

            .state('errorOne', {
                url: "/errorOne",
                templateUrl: "views/errorOne.html",
                data: {pageTitle: '404', specialClass: 'gray-bg'}
            })
            .state('errorTwo', {
                url: "/errorTwo",
                templateUrl: "views/errorTwo.html",
                data: {pageTitle: '500', specialClass: 'gray-bg'}
            })
            .state('ui', {
                abstract: true,
                url: "/ui",
                templateUrl: "views/common/content.html",
            })
            .state('ui.typography', {
                url: "/typography",
                templateUrl: "views/typography.html",
                data: {pageTitle: 'Typography'}
            })
            .state('ui.icons', {
                url: "/icons",
                templateUrl: "views/icons.html",
                data: {pageTitle: 'Icons'}
            })
            .state('ui.buttons', {
                url: "/buttons",
                templateUrl: "views/buttons.html",
                data: {pageTitle: 'Buttons'}
            })
            .state('ui.tabs_panels', {
                url: "/tabs_panels",
                templateUrl: "views/tabs_panels.html",
                data: {pageTitle: 'Panels'}
            })
            .state('ui.tabs', {
                url: "/tabs",
                templateUrl: "views/tabs.html",
                data: {pageTitle: 'Tabs'}
            })
            .state('ui.notifications_tooltips', {
                url: "/notifications_tooltips",
                templateUrl: "views/notifications.html",
                data: {pageTitle: 'Notifications and tooltips'}
            })
            .state('ui.badges_labels', {
                url: "/badges_labels",
                templateUrl: "views/badges_labels.html",
                data: {pageTitle: 'Badges and labels and progress'}
            })
            .state('ui.video', {
                url: "/video",
                templateUrl: "views/video.html",
                data: {pageTitle: 'Responsible Video'}
            })
            .state('ui.draggable', {
                url: "/draggable",
                templateUrl: "views/draggable.html",
                data: {pageTitle: 'Draggable panels'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'ui.sortable',
                                files: ['js/plugins/ui-sortable/sortable.js']
                            }
                        ]);
                    }
                }
            })
            .state('grid_options', {
                url: "/grid_options",
                templateUrl: "views/grid_options.html",
                data: {pageTitle: 'Grid options'}
            })
            .state('miscellaneous', {
                abstract: true,
                url: "/miscellaneous",
                templateUrl: "views/common/content.html",
            })
            .state('miscellaneous.google_maps', {
                url: "/google_maps",
                templateUrl: "views/google_maps.html",
                data: {pageTitle: 'Google maps'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'ui.event',
                                files: ['js/plugins/uievents/event.js']
                            },
                            {
                                name: 'ui.map',
                                files: ['js/plugins/uimaps/ui-map.js']
                            },
                        ]);
                    }
                }
            })
            .state('miscellaneous.code_editor', {
                url: "/code_editor",
                templateUrl: "views/code_editor.html",
                data: {pageTitle: 'Code Editor'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                files: ['css/plugins/codemirror/codemirror.css', 'css/plugins/codemirror/ambiance.css', 'js/plugins/codemirror/codemirror.js', 'js/plugins/codemirror/mode/javascript/javascript.js']
                            },
                            {
                                name: 'ui.codemirror',
                                files: ['js/plugins/ui-codemirror/ui-codemirror.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.modal_window', {
                url: "/modal_window",
                templateUrl: "views/modal_window.html",
                data: {pageTitle: 'Modal window'}
            })
            .state('miscellaneous.chat_view', {
                url: "/chat_view",
                templateUrl: "views/chat_view.html",
                data: {pageTitle: 'Chat view'}
            })
            .state('miscellaneous.nestable_list', {
                url: "/nestable_list",
                templateUrl: "views/nestable_list.html",
                data: {pageTitle: 'Nestable List'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'ui.tree',
                                files: ['css/plugins/uiTree/angular-ui-tree.min.css', 'js/plugins/uiTree/angular-ui-tree.min.js']
                            },
                        ]);
                    }
                }
            })
            .state('miscellaneous.notify', {
                url: "/notify",
                templateUrl: "views/notify.html",
                data: {pageTitle: 'Notifications for angularJS'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'cgNotify',
                                files: ['css/plugins/angular-notify/angular-notify.min.css', 'js/plugins/angular-notify/angular-notify.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.timeline_2', {
                url: "/timeline_2",
                templateUrl: "views/timeline_2.html",
                data: {pageTitle: 'Timeline version 2'}
            })
            .state('miscellaneous.forum_view', {
                url: "/forum_view",
                templateUrl: "views/forum_view.html",
                data: {pageTitle: 'Forum - general view'}
            })
            .state('miscellaneous.forum_post_view', {
                url: "/forum_post_view",
                templateUrl: "views/forum_post_view.html",
                data: {pageTitle: 'Forum - post view'}
            })
            .state('miscellaneous.diff', {
                url: "/diff",
                templateUrl: "views/diff.html",
                data: {pageTitle: 'Text Diff'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/diff_match_patch/javascript/diff_match_patch.js']
                            },
                            {
                                name: 'diff-match-patch',
                                files: ['js/plugins/angular-diff-match-patch/angular-diff-match-patch.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.sweet_alert', {
                url: "/sweet_alert",
                templateUrl: "views/sweet_alert.html",
                data: {pageTitle: 'Sweet alert'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/sweetalert/sweetalert.min.js', 'css/plugins/sweetalert/sweetalert.css']
                            },
                            {
                                name: 'oitozero.ngSweetAlert',
                                files: ['js/plugins/sweetalert/angular-sweetalert.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.idle_timer', {
                url: "/idle_timer",
                templateUrl: "views/idle_timer.html",
                data: {pageTitle: 'Idle timer'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'cgNotify',
                                files: ['css/plugins/angular-notify/angular-notify.min.css', 'js/plugins/angular-notify/angular-notify.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.live_favicon', {
                url: "/live_favicon",
                templateUrl: "views/live_favicon.html",
                data: {pageTitle: 'Live favicon'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/tinycon/tinycon.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.spinners', {
                url: "/spinners",
                templateUrl: "views/spinners.html",
                data: {pageTitle: 'Spinners'}
            })
            .state('miscellaneous.validation', {
                url: "/validation",
                templateUrl: "views/validation.html",
                data: {pageTitle: 'Validation'}
            })
            .state('miscellaneous.agile_board', {
                url: "/agile_board",
                templateUrl: "views/agile_board.html",
                data: {pageTitle: 'Agile board'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'ui.sortable',
                                files: ['js/plugins/ui-sortable/sortable.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.masonry', {
                url: "/masonry",
                templateUrl: "views/masonry.html",
                data: {pageTitle: 'Masonry'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/masonry/masonry.pkgd.min.js']
                            },
                            {
                                name: 'wu.masonry',
                                files: ['js/plugins/masonry/angular-masonry.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.toastr', {
                url: "/toastr",
                templateUrl: "views/toastr.html",
                data: {pageTitle: 'Toastr'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                insertBefore: '#loadBefore',
                                name: 'toaster',
                                files: ['js/plugins/toastr/toastr.min.js', 'css/plugins/toastr/toastr.min.css']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.i18support', {
                url: "/i18support",
                templateUrl: "views/i18support.html",
                data: {pageTitle: 'i18support'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                insertBefore: '#loadBefore',
                                name: 'toaster',
                                files: ['js/plugins/toastr/toastr.min.js', 'css/plugins/toastr/toastr.min.css']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.truncate', {
                url: "/truncate",
                templateUrl: "views/truncate.html",
                data: {pageTitle: 'Truncate'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/dotdotdot/jquery.dotdotdot.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.clipboard', {
                url: "/clipboard",
                templateUrl: "views/clipboard.html",
                data: {pageTitle: 'Clipboard'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/ngclipboard/clipboard.min.js']
                            },
                            {
                                name: 'ngclipboard',
                                files: ['js/plugins/ngclipboard/ngclipboard.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.loading_buttons', {
                url: "/loading_buttons",
                templateUrl: "views/loading_buttons.html",
                data: {pageTitle: 'Loading buttons'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                name: 'angular-ladda',
                                files: ['js/plugins/ladda/spin.min.js', 'js/plugins/ladda/ladda.min.js', 'css/plugins/ladda/ladda-themeless.min.css', 'js/plugins/ladda/angular-ladda.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.tour', {
                url: "/tour",
                templateUrl: "views/tour.html",
                data: {pageTitle: 'Tour'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                insertBefore: '#loadBefore',
                                files: ['js/plugins/bootstrap-tour/bootstrap-tour.min.js', 'css/plugins/bootstrap-tour/bootstrap-tour.min.css']
                            },
                            {
                                name: 'bm.bsTour',
                                files: ['js/plugins/angular-bootstrap-tour/angular-bootstrap-tour.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('miscellaneous.tree_view', {
                url: "/tree_view",
                templateUrl: "views/tree_view.html",
                data: {pageTitle: 'Tree view'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/jsTree/style.min.css', 'js/plugins/jsTree/jstree.min.js']
                            },
                            {
                                name: 'ngJsTree',
                                files: ['js/plugins/jsTree/ngJsTree.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('tables', {
                abstract: true,
                url: "/tables",
                templateUrl: "views/common/content.html"
            })
            .state('tables.static_table', {
                url: "/static_table",
                templateUrl: "views/table_basic.html",
                data: {pageTitle: 'Static table'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'angular-peity',
                                files: ['js/plugins/peity/jquery.peity.min.js', 'js/plugins/peity/angular-peity.js']
                            },
                            {
                                files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('tables.data_tables', {
                url: "/data_tables",
                templateUrl: "views/table_data_tables.html",
                data: {pageTitle: 'Data Tables'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                files: ['js/plugins/dataTables/datatables.min.js', 'css/plugins/dataTables/datatables.min.css']
                            },
                            {
                                serie: true,
                                name: 'datatables',
                                files: ['js/plugins/dataTables/angular-datatables.min.js']
                            },
                            {
                                serie: true,
                                name: 'datatables.buttons',
                                files: ['js/plugins/dataTables/angular-datatables.buttons.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('tables.foo_table', {
                url: "/foo_table",
                templateUrl: "views/foo_table.html",
                data: {pageTitle: 'Foo Table'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                            },
                            {
                                name: 'ui.footable',
                                files: ['js/plugins/footable/angular-footable.js']
                            }
                        ]);
                    }
                }
            })
            .state('tables.nggrid', {
                url: "/nggrid",
                templateUrl: "views/nggrid.html",
                data: {pageTitle: 'ng Grid'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'ngGrid',
                                files: ['js/plugins/nggrid/ng-grid-2.0.3.min.js']
                            },
                            {
                                insertBefore: '#loadBefore',
                                files: ['js/plugins/nggrid/ng-grid.css']
                            }
                        ]);
                    }
                }
            })

//custom projects

            .state('custom', {
                abstract: true,
                url: "/custom_projects",
                templateUrl: "views/common/content.html",
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                            },
                            {
                                name: 'ui.footable',
                                files: ['js/plugins/footable/angular-footable.js']
                            }
                        ]);
                    }
                }
            })
            .state('custom.order_form', {
                url: "/order_form",
                templateUrl: "views/custom_projects/order_form.html",
                controller: 'ecommerceController',
                controllerAs: 'em',
                data: {pageTitle: 'Order a custom project'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/slick/slick.css', 'css/plugins/slick/slick-theme.css', 'js/plugins/slick/slick.min.js']
                            },
                            {
                                name: 'slick',
                                files: ['js/plugins/slick/angular-slick.min.js']
                            },
                            {
                                files: ['js/plugins/moment/moment.min.js']
                            },
                            {
                                name: 'ui.knob',
                                files: ['js/plugins/jsKnob/jquery.knob.js', 'js/plugins/jsKnob/angular-knob.js']
                            },
                            {
                                files: ['css/plugins/ionRangeSlider/ion.rangeSlider.css', 'css/plugins/ionRangeSlider/ion.rangeSlider.skinFlat.css', 'js/plugins/ionRangeSlider/ion.rangeSlider.min.js']
                            },
                            {
                                insertBefore: '#loadBefore',
                                name: 'localytics.directives',
                                files: ['css/plugins/chosen/chosen.css', 'js/plugins/chosen/chosen.jquery.js', 'js/plugins/chosen/chosen.js']
                            },
                            {
                                name: 'nouislider',
                                files: ['css/plugins/nouslider/jquery.nouislider.css', 'js/plugins/nouslider/jquery.nouislider.min.js', 'js/plugins/nouslider/angular-nouislider.js']
                            },
                            {
                                name: 'datePicker',
                                files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                            },
                            {
                                files: ['js/plugins/jasny/jasny-bootstrap.min.js']
                            },
                            {
                                files: ['css/plugins/clockpicker/clockpicker.css', 'js/plugins/clockpicker/clockpicker.js']
                            },
                            {
                                name: 'ui.switchery',
                                files: ['css/plugins/switchery/switchery.css', 'js/plugins/switchery/switchery.js', 'js/plugins/switchery/ng-switchery.js']
                            },
                            
                            {
                                name: 'ngImgCrop',
                                files: ['js/plugins/ngImgCrop/ng-img-crop.js', 'css/plugins/ngImgCrop/ng-img-crop.css']
                            },
                            {
                                serie: true,
                                files: ['js/plugins/daterangepicker/daterangepicker.js', 'css/plugins/daterangepicker/daterangepicker-bs3.css']
                            },
                            {
                                name: 'daterangepicker',
                                files: ['js/plugins/daterangepicker/angular-daterangepicker.js']
                            },
                            {
                                files: ['css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css']
                            },
                            {
                                name: 'ui.select',
                                files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                            },
                            {
                                files: ['css/plugins/touchspin/jquery.bootstrap-touchspin.min.css', 'js/plugins/touchspin/jquery.bootstrap-touchspin.min.js']
                            }

                        ]);
                    }
                }

            })
            .state('custom.orders', {
                url: "/orders",
                controller: 'ecommerceController',
                controllerAs: 'em',
                templateUrl: "views/custom_projects/orders.html",
                data: {pageTitle: 'My custom projects'}
            })


            //ecommerce

            .state('commerce', {
                abstract: true,
                url: "/commerce",
                templateUrl: "views/common/content.html",
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                            },
                            {
                                name: 'ui.footable',
                                files: ['js/plugins/footable/angular-footable.js']
                            }
                        ]);
                    }
                }
            })
            .state('commerce.invoice', {
                url: "/invoice",
                templateUrl: "views/ecommerce/invoice.html",
                data: {pageTitle: 'Invoice'}
            })
            .state('invoice_print', {
                url: "/invoice_print",
                templateUrl: "views/ecommerce/invoice_print.html",
                data: {pageTitle: 'Invoice'}
            })
            .state('commerce.confirmation', {
                url: "/confirmation",
                templateUrl: "views/ecommerce/confirmation.html",
                data: {pageTitle: 'Payment confirmation'}
            })
            .state('confirmation_print', {
                url: "/confirmation_print",
                templateUrl: "views/ecommerce/confirmation_print.html",
                data: {pageTitle: 'Payment confirmation'}
            })
            .state('commerce.products_grid', {
                url: "/products_grid",
                templateUrl: "views/ecommerce/ecommerce_products_grid.html",
                data: {pageTitle: 'E-commerce grid'}
            })
            .state('commerce.product_list', {
                url: "/product_list",
                templateUrl: "views/ecommerce/ecommerce_product_list.html",
                data: {pageTitle: 'E-commerce product list'}
            })
            .state('commerce.orders', {
                url: "/orders",
                controller: 'ecommerceController',
                controllerAs: 'em',
                templateUrl: "views/ecommerce/ecommerce_orders.html",
                data: {pageTitle: 'My purchases'}
            })
            .state('commerce.product', {
                url: "/product",
                templateUrl: "views/ecommerce/ecommerce_product.html",
                data: {pageTitle: 'Product edit'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/summernote/summernote.css', 'css/plugins/summernote/summernote-bs3.css', 'js/plugins/summernote/summernote.min.js']
                            },
                            {
                                name: 'summernote',
                                files: ['css/plugins/summernote/summernote.css', 'css/plugins/summernote/summernote-bs3.css', 'js/plugins/summernote/summernote.min.js', 'js/plugins/summernote/angular-summernote.min.js']
                            }
                        ]);
                    }
                }

            })
            .state('commerce.product_details1', {
                url: "/product_details1",
                templateUrl: "views/ecommerce/ecommerce_product_details1.html",
                controller: 'ecommerceController',
                controllerAs: 'em',
                data: {pageTitle: 'Purchase extra options > Additional content'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/slick/slick.css', 'css/plugins/slick/slick-theme.css', 'js/plugins/slick/slick.min.js']
                            },
                            {
                                name: 'slick',
                                files: ['js/plugins/slick/angular-slick.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('commerce.product_details2', {
                url: "/product_details2",
                templateUrl: "views/ecommerce/ecommerce_product_details2.html",
                controller: 'ecommerceController',
                controllerAs: 'em',
                data: {pageTitle: 'Purchase extra options > Extra upload/storage size'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                name: 'angular-flot',
                                files: ['js/plugins/flot/jquery.flot.js',
                                    'js/plugins/flot/jquery.flot.time.js',
                                    'js/plugins/flot/jquery.flot.tooltip.min.js', 
                                    'js/plugins/flot/jquery.flot.spline.js', 
                                    'js/plugins/flot/jquery.flot.resize.js',
                                    'js/plugins/flot/jquery.flot.pie.js', 
                                    'js/plugins/flot/curvedLines.js', 
                                    'js/plugins/flot/angular-flot.js']
                            },
                            {
                                files: ['css/plugins/slick/slick.css', 'css/plugins/slick/slick-theme.css', 'js/plugins/slick/slick.min.js']
                            },
                            {
                                name: 'slick',
                                files: ['js/plugins/slick/angular-slick.min.js']
                            },
                            {
                                files: ['css/plugins/ionRangeSlider/ion.rangeSlider.css', 'css/plugins/ionRangeSlider/ion.rangeSlider.skinFlat.css', 'js/plugins/ionRangeSlider/ion.rangeSlider.min.js']
                            },
                            {
                                files: ['css/plugins/touchspin/jquery.bootstrap-touchspin.min.css', 'js/plugins/touchspin/jquery.bootstrap-touchspin.min.js']
                            }
                            
                        ]);
                    }
                }
            })
            
            .state('storage.stats', {
                url: "/form_stats",
                templateUrl: "views/file_manager/form_stats.html",
                data: {pageTitle: 'Statistics'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                serie: true,
                                name: 'angular-flot',
                                files: ['js/plugins/flot/jquery.flot.js', 
                                    'js/plugins/flot/jquery.flot.time.js', 
                                    'js/plugins/flot/jquery.flot.tooltip.min.js', 
                                    'js/plugins/flot/jquery.flot.spline.js', 
                                    'js/plugins/flot/jquery.flot.resize.js', 
                                    'js/plugins/flot/jquery.flot.pie.js',
                                    'js/plugins/flot/curvedLines.js', 
                                    'js/plugins/flot/angular-flot.js']
                            }
                        ]);
                    }
                }
            })
            
            
            .state('commerce.product_details3', {
                url: "/product_details3",
                templateUrl: "views/ecommerce/ecommerce_product_details3.html",
                controller: 'ecommerceController',
                controllerAs: 'em',
                data: {pageTitle: 'Purchase extra options > Processing capacity'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['css/plugins/slick/slick.css', 'css/plugins/slick/slick-theme.css', 'js/plugins/slick/slick.min.js']
                            },
                            {
                                name: 'slick',
                                files: ['js/plugins/slick/angular-slick.min.js']
                            }
                        ]);
                    }
                }
            })

            .state('commerce.payments', {
                url: "/payments",
                controller: 'ecommerceController',
                controllerAs: 'em',
                templateUrl: "views/ecommerce/ecommerce_payments.html",
                data: {pageTitle: 'E-commerce payments'}
            })
            .state('commerce.cart', {
                url: "/cart",
                templateUrl: "views/ecommerce/ecommerce_cart.html",
                controller: 'ecommerceController',
                controllerAs: 'em',
                data: {pageTitle: 'Shopping cart'}
            })
            .state('commerce.stripe', {
                url: "/stripe",
                templateUrl: "views/ecommerce/stripe_form.html",
                data: {pageTitle: 'Stripe form'}
            })

            .state('css_animations', {
                url: "/css_animations",
                templateUrl: "views/css_animation.html",
                data: {pageTitle: 'CSS Animations'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                reconfig: true,
                                serie: true,
                                files: ['js/plugins/rickshaw/vendor/d3.v3.js', 'js/plugins/rickshaw/rickshaw.min.js']
                            },
                            {
                                reconfig: true,
                                name: 'angular-rickshaw',
                                files: ['js/plugins/rickshaw/angular-rickshaw.js']
                            }
                        ]);
                    }
                }

            })
            .state('landing', {
                url: "/",
                templateUrl: "views/landing.html",
                data: {pageTitle: 'Bioinformatics data processing made easy', specialClass: 'landing-page'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/wow/wow.min.js']
                            }
                        ]);
                    }
                }
            })
            .state('outlook', {
                url: "/outlook",
                templateUrl: "views/outlook.html",
                data: {pageTitle: 'Outlook view', specialClass: 'fixed-sidebar'}
            })
            .state('off_canvas', {
                url: "/off_canvas",
                templateUrl: "views/off_canvas.html",
                data: {pageTitle: 'Off canvas menu', specialClass: 'canvas-menu'}
            })
            .state('guides', {
                abstract: true,
                url: "/guides",
                templateUrl: "views/common/content.html"
            })
            .state('guides.article1', {
                url: "/article1",
                templateUrl: "views/guides/article1.html",
                data: {pageTitle: 'Article 1'}
            })
            .state('guides.article2', {
                url: "/article2",
                templateUrl: "views/guides/article2.html",
                data: {pageTitle: 'Article 2'}
            })
            .state('guides.article3', {
                url: "/article3",
                templateUrl: "views/guides/article3.html",
                data: {pageTitle: 'Article 3'}
            })
            .state('guides.article4', {
                url: "/article4",
                templateUrl: "views/guides/article4.html",
                data: {pageTitle: 'Article 4'}
            })
            .state('guides.article5', {
                url: "/article5",
                templateUrl: "views/guides/article5.html",
                data: {pageTitle: 'Article 5'}
            })
            .state('blog', {
                abstract: true,
                url: "/blog",
                templateUrl: "views/common/blog.html",
            })
            .state('blog.article1', {
                url: "/article1",
                templateUrl: "views/guides/article1.html",
                data: {pageTitle: 'FASTA/FASTQ format'}
            })
            .state('blog.article4', {
                url: "/article4",
                templateUrl: "views/guides/article4.html",
                data: {pageTitle: 'Genomics 101: what is going on in the lab? '}
            })

            .state('blog.article5', {
                url: "/article5",
                templateUrl: "views/guides/article5.html",
                data: {pageTitle: 'What is the reference genome?'}
            })
            ;

}
angular
        .module('inspinia')
        .config(['$stateProvider', '$locationProvider', '$urlRouterProvider', '$ocLazyLoadProvider', 'IdleProvider', 'KeepaliveProvider', config])
        .run(function ($rootScope, $state) {
            $rootScope.$state = $state;

            //fix scrolling
            $rootScope.$on('$stateChangeSuccess', function () {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            });


            var debug = false;

            if (debug) {
                $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                    console.log('$stateChangeStart to ' + toState.to + '- fired when the transition begins. toState,toParams : \n', toState, toParams);
                });
                $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                    console.log('$stateChangeError - fired when an error occurs during transition.');
                    console.log(arguments);
                });
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    console.log('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
                });
// $rootScope.$on('$viewContentLoading',function(event, viewConfig){
//   // runs on individual scopes, so putting it in "run" doesn't work.
//   console.log('$viewContentLoading - view begins loading - dom not rendered',viewConfig);
// });
                $rootScope.$on('$viewContentLoaded', function (event) {
                    console.log('$viewContentLoaded - fired after dom rendered', event);
                });
                $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
                    console.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
                    console.log(unfoundState, fromState, fromParams);
                });
            }
        });
