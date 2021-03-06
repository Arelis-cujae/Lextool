
<?php

use yii\bootstrap\ActiveForm;
use yii\bootstrap\Modal;
use yii\helpers\Html;
use kartik\grid\GridView;
use yii\widgets\Pjax;
use yii\helpers\Url;


/* @var $this yii\web\View */
/* @var $searchModel backend\models\LemmaSearch */
/* @var $currentLetter backend\models\Lemma */
/* @var $dataProvider yii\data\ActiveDataProvider */

$this->title = 'Planes de revisión de lemas candidatos';
//$this->params['breadcrumbs'][] = ['label' => $project->name , 'url' => ['project/dictionary','id' => $project->id_project]];
$this->params['breadcrumbs'][] = $this->title;
?>
<div id="id_project" class="hidden"><?=$project->id_project?></div>
<div id="name_project" class="hidden"><?=$project->name?></div>
<div class="plans">

    <div id="app" class="lemma-index">
        <section id="demos">
            <div class="row">
                <div class="large-12 columns">
                    <div class="owl-carousel owl-theme">
                        <?php
                        foreach ($plans as $plan) {
                            if (count($plan->extPlan->lemmas) > 0) {
                                if (strtotime(date("Y-m-d")) > strtotime(date($plan->end_date))) {
                                    if ($plan->edition) {
                                        echo ' 
                <div class="item" style="padding: 25px 20px">
                    <div class="card" style="width: 100%">
        <div class="card-body">
            <img  style="width: 45%; height: 150px; margin-right: 0px"  class="card-img-top" src="../../web/uploads/project/image/'.$plan->project->image.'" alt="Card image cap">
            <h3>'.$plan->project->name.'</h3>
            <p><strong>Plan: </strong> ' . $plan->extPlan->getExt_plan_name() . '</p>
            <p><strong>Usuario:</strong> '.$plan->user->full_name.'</p>
            <p style="color: #dd4b39"><strong>Estado:</strong> Atrasado </p>
            <p><strong>Derecho de edición: </strong>Sí</p>
            <p><strong>Fecha inicio: </strong>' . $plan->start_date . '</p>
            <p> <strong>Fecha fin: </strong> ' . $plan->end_date . '</p>
            <a class="btn btn-danger" href="'.Url::to(['lemma_rev_task/index', 'id_rev_plan' => $plan->id_rev_plan]).'">Continuar <i class="fa fa-arrow-circle-right"></i></a>
        </div>
    </div>
                </div>
                ';
                                    }else {
                                        echo ' 
                <div class="item" style="padding: 25px 20px">
                    <div class="card" style="width: 100%">
      <div class="card-body">
        <img  style="width: 45%; height: 150px; margin-right: 0px"  class="card-img-top" src="../../web/uploads/project/image/'.$plan->project->image.'" alt="Card image cap">
        <h3>'.$plan->project->name.'</h3>
        <p><strong>Plan: </strong> ' . $plan->extPlan->getExt_plan_name() . '</p>
        <p><strong>Usuario:</strong> '.$plan->user->full_name.'</p>
        <p><strong>Estado:</strong> Atrasado </p>
        <p><strong>Derecho de edición: </strong>No</p>
        <p><strong>Fecha inicio: </strong>' . $plan->start_date . '</p>
        <p> <strong>Fecha fin: </strong> ' . $plan->end_date . '</p>
        <a class="btn btn-success" href="'.Url::to(['lemma_rev_task/index', 'id_rev_plan' => $plan->id_rev_plan]).'">Continuar <i class="fa fa-arrow-circle-right"></i></a>
        </div>
    </div>
                </div>
                ';
                                    }
                                }else {
                                    if ($plan->edition) {
                                        echo ' 
                <div class="item" style="padding: 25px 20px">
                   <div class="card" style="width: 100%">
   
    <div class="card-body">
        <img  style="width: 45%; height: 150px; margin-right: 0px"  class="card-img-top" src="../../web/uploads/project/image/'.$plan->project->image.'" alt="Card image cap">
        <h3>'.$plan->project->name.'</h3>
        <p><strong>Plan: </strong> ' . $plan->extPlan->getExt_plan_name() . '</p>
        <p><strong>Usuario:</strong> '.$plan->user->full_name.'</p>
        <p style="color:#00a65a;"><strong>Estado:</strong> En Tiempo </p>
        <p><strong>Derecho de edición: </strong>Sí</p>
        <p><strong>Fecha inicio: </strong>' . $plan->start_date . '</p>
        <p> <strong>Fecha fin: </strong> ' . $plan->end_date . '</p>
        <a class="btn btn-success" href="'.Url::to(['lemma_rev_task/index', 'id_rev_plan' => $plan->id_rev_plan]).'">Continuar <i class="fa fa-arrow-circle-right"></i></a>
    </div>
</div>
                </div>
                ';
                                    }else {
                                        echo ' 
                <div class="item" style="padding: 25px 20px">
                  <div class="card" style="width: 100%">
    <div class="card-body">
        <img  style="width: 45%; height: 150px; margin-right: 0px"  class="card-img-top" src="../../web/uploads/project/image/'.$plan->project->image.'" alt="Card image cap">
        <h3>'.$plan->project->name.'</h3>
        <p><strong>Plan: </strong> ' . $plan->extPlan->getExt_plan_name() . '</p>
        <p><strong>Usuario:</strong> '.$plan->user->full_name.'</p>
        <p style="color:#00a65a;"><strong>Estado:</strong> En Tiempo </p>
        <p><strong>Derecho de edición: </strong>No</p>
        <p><strong>Fecha inicio: </strong>' . $plan->start_date . '</p>
        <p> <strong>Fecha fin: </strong> ' . $plan->end_date . '</p>
        <a class="btn btn-success" href="'.Url::to(['lemma_rev_task/index', 'id_rev_plan' => $plan->id_rev_plan]).'">Continuar <i class="fa fa-arrow-circle-right"></i></a>
    </div>
</div>
                </div>
                ';
                                    }
                                }
                            }
                        }
                        ?>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>

