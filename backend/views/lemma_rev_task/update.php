<?php
use yii\bootstrap\ActiveForm;
use yii\helpers\Html;
use yii\helpers\Url;

/* @var $this yii\web\View */
/* @var $model backend\models\Lemma */

$this->title = 'Editar lema candidato: '.$model->original_lemma;
//$this->params['breadcrumbs'][] = ['label' => $project->name , 'url' => ['project/view','id' => $project->id_project]];
$this->params['breadcrumbs'][] = ['label' => 'Planes de revisión de lemas candidatos' , 'url' => ['lemma_rev_task/plans','id_project' => $project->id_project]];
$this->params['breadcrumbs'][] = ['label' => 'Lemas candidatos' , 'url' => ['lemma_rev_task/index','id_rev_plan' => $rev_plan->id_rev_plan]];
$this->params['breadcrumbs'][] = ['label' => $model->original_lemma , 'url' => ['lemma_rev_task/view', 'id' => $model->id_lemma, 'id_rev_plan' => $rev_plan->id_rev_plan]];
$this->params['breadcrumbs'][] = 'Editar';
?>
<div id="id_project" class="hidden"><?=$project->id_project?></div>
<div id="name_project" class="hidden"><?=$project->name?></div>
<div class="lemma-create">

    <div class="box box-primary">
        <div class="box-header with-border">
            <h2 class="box-title"><i class="fa fa-language"></i> <?= $this->title ?></h2>
        </div>
        <div class="box-body">

            <div class="row">
                <div class="col-md-12">
                    <h3>Letra: <?= $letter->letter ?></h3>
                </div>
            </div>

            <?php
            if (count($ext_plan->semanticFields) > 0){
                echo  '<div class="row">
                <div class="col-md-12">
                 <h3>Campos semánticos</h3>
                 <ul class="list-unstyled">';
                foreach ($ext_plan->semanticFields as $semanticField){
                    echo '<li><i class="fa fa-check"></i> '.$semanticField->name.'</li>';
                }
                echo '</ul> </div></div>';
            }
            ?>

            <?php
            foreach ($extension as $ext) {
                if ($ext == "pdf" && !$source->editable){
                    echo $this->render('_form-pdf', [
                        'model' => $model,
                        'source' => $source,
                        'ext_plan' => $ext_plan,
                        'letter' => $letter,
                        'project' => $project,
                        'rev_plan' => $rev_plan,
                        'elements' => $elements
                    ]);
                }elseif ($ext == "jpg" ||
                    $ext == "jpeg" ||
                    $ext == "png") {
                    echo $this->render('_form-image', [
                        'model' => $model,
                        'source' => $source,
                        'ext_plan' => $ext_plan,
                        'letter' => $letter,
                        'project' => $project,
                        'rev_plan' => $rev_plan,
                        'elements' => $elements
                    ]);
                }else if($ext == "pdf" && $source->editable) {
                    echo $this->render('_form', [
                        'model' => $model,
                        'source' => $source,
                        'ext_plan' => $ext_plan,
                        'letter' => $letter,
                        'project' => $project,
                        'rev_plan' => $rev_plan,
                        'elements' => $elements
                    ]);
                }
            }
            ?>
        </div>
    </div>
</div>